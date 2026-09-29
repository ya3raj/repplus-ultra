import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { RepPlusHttpBridge } from "./bridge/httpBridge.js";
import { endpointInventory, parameterInventory, reflections } from "./tools/analysis.js";

const bridge = new RepPlusHttpBridge();
const server = new McpServer({ name: "repplus-codex", version: "0.1.0" });

const json = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] });

server.tool(
  "list_http_history",
  "List HTTP exchanges captured by rep+ with optional filters.",
  {
    host: z.string().optional(),
    method: z.string().optional(),
    status: z.number().int().optional(),
    text: z.string().optional(),
    limit: z.number().int().min(1).max(1000).default(100),
    offset: z.number().int().min(0).default(0),
  },
  async (args) => json(await bridge.listHistory(args)),
);

server.tool(
  "get_http_exchange",
  "Fetch one captured request/response pair by rep+ history id.",
  { id: z.string() },
  async ({ id }) => json(await bridge.getExchange(id)),
);

server.tool(
  "search_http_history",
  "Search captured URLs, headers and bodies in rep+ history.",
  { query: z.string(), host: z.string().optional(), limit: z.number().int().min(1).max(1000).default(100) },
  async ({ query, ...filter }) => json(await bridge.searchHistory(query, filter)),
);

server.tool(
  "list_endpoints",
  "Build an endpoint inventory from captured rep+ traffic.",
  { host: z.string().optional(), limit: z.number().int().min(1).max(5000).default(1000) },
  async (filter) => json(endpointInventory(await bridge.listHistory(filter))),
);

server.tool(
  "list_parameters",
  "Inventory observed query, header, form and JSON parameters across rep+ history.",
  { host: z.string().optional(), limit: z.number().int().min(1).max(5000).default(1000) },
  async (filter) => json(parameterInventory(await bridge.listHistory(filter))),
);

server.tool(
  "find_reflections",
  "Find request-controlled query/form/JSON values that appear verbatim in response bodies. This is a signal, not a vulnerability verdict.",
  { host: z.string().optional(), limit: z.number().int().min(1).max(5000).default(1000) },
  async (filter) => json(reflections(await bridge.listHistory(filter))),
);

server.tool(
  "get_site_map",
  "Return hosts and endpoint inventory derived from captured rep+ traffic.",
  { host: z.string().optional(), limit: z.number().int().min(1).max(5000).default(2000) },
  async (filter) => {
    const exchanges = await bridge.listHistory(filter);
    return json({
      hosts: [...new Set(exchanges.map((x) => x.request.host))].sort(),
      endpoints: endpointInventory(exchanges),
    });
  },
);

server.tool(
  "compare_responses",
  "Compare two captured responses by status, headers and body length/content equality.",
  { firstId: z.string(), secondId: z.string() },
  async ({ firstId, secondId }) => {
    const [a, b] = await Promise.all([bridge.getExchange(firstId), bridge.getExchange(secondId)]);
    if (!a || !b) return json({ error: "One or both history ids were not found." });
    const ah = a.response?.headers ?? {};
    const bh = b.response?.headers ?? {};
    const headerNames = [...new Set([...Object.keys(ah), ...Object.keys(bh)])].sort();
    return json({
      firstId,
      secondId,
      status: [a.response?.status ?? null, b.response?.status ?? null],
      bodyLength: [a.response?.body?.length ?? 0, b.response?.body?.length ?? 0],
      bodyEqual: (a.response?.body ?? "") === (b.response?.body ?? ""),
      headerDiff: headerNames.flatMap((name) => ah[name] === bh[name] ? [] : [{ name, first: ah[name], second: bh[name] }]),
    });
  },
);

server.tool(
  "replay_request",
  "Replay a captured request through rep+. Disabled unless REPPLUS_ALLOW_REPLAY=1 is explicitly set.",
  {
    id: z.string(),
    method: z.string().optional(),
    url: z.string().url().optional(),
    headers: z.record(z.string()).optional(),
    body: z.string().optional(),
  },
  async ({ id, ...overrides }) => json(await bridge.replay(id, overrides)),
);

await server.connect(new StdioServerTransport());
