import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RepPlusBridge } from "../bridge/types.js";

const json=(v:unknown)=>({content:[{type:"text" as const,text:JSON.stringify(v,null,2)}]});

export function registerParityTools(server:McpServer, bridge:RepPlusBridge) {
  server.tool("repplus_info","Report installed rep+ bridge version and supported capabilities.",{},async()=>json(await bridge.info()));

  server.tool("extract_endpoints","Run rep+'s native endpoint extractor over captured content.",
    {host:z.string().optional()},async(args)=>json(await bridge.action("extract-endpoints",args)));
  server.tool("extract_parameters","Run rep+'s native parameter extractor/risk analysis.",
    {host:z.string().optional()},async(args)=>json(await bridge.action("extract-parameters",args)));
  server.tool("extract_secrets","Run rep+'s Kingfisher-backed secret scanner over captured content.",
    {host:z.string().optional()},async(args)=>json(await bridge.action("extract-secrets",args)));
  server.tool("search_responses","Search captured response content.",
    {query:z.string(),host:z.string().optional()},async(args)=>json(await bridge.action("response-search",args)));

  server.tool("get_timeline","Get rep+ timeline/grouping state.",
    {host:z.string().optional()},async(args)=>json(await bridge.action("timeline",args)));
  server.tool("get_response_history","Get response/replay history for a request.",
    {requestId:z.string()},async(args)=>json(await bridge.action("response-history",args)));
  server.tool("list_starred","List starred rep+ requests/pages/domains.",{},async()=>json(await bridge.action("list-starred")));
  server.tool("star_request","Set request starred state.",
    {requestId:z.string(),starred:z.boolean()},async(args)=>json(await bridge.action("star",args)));
  server.tool("tag_request","Set a rep+ request color/tag.",
    {requestId:z.string(),tag:z.string().nullable()},async(args)=>json(await bridge.action("tag",args)));

  server.tool("get_capture_settings","Get capture and multi-tab state.",{},async()=>json(await bridge.action("capture-settings")));
  server.tool("set_multi_tab_capture","Enable or disable rep+ multi-tab capture. Browser permission may require user approval.",
    {enabled:z.boolean()},async(args)=>json(await bridge.action("multi-tab",args)));
  server.tool("get_blocking_state","Get request blocking queue/state.",{},async()=>json(await bridge.action("blocking-state")));
  server.tool("set_request_blocking","Enable or disable request blocking.",
    {enabled:z.boolean()},async(args)=>json(await bridge.action("blocking",args)));
  server.tool("forward_blocked_request","Forward one blocked request.",
    {requestId:z.string()},async(args)=>json(await bridge.action("forward",args)));

  server.tool("get_request_editor","Read the current raw request text from the selected rep+ request editor.",
    {requestId:z.string()},async(args)=>json(await bridge.action("get-request-editor",args)));
  server.tool("edit_request","Replace the selected rep+ request editor content. The captured request remains immutable; the edit is undoable and is what Rep+ will replay.",
    {requestId:z.string(),rawRequest:z.string().min(1).max(2_000_000)},async(args)=>json(await bridge.action("edit-request",args)));
  server.tool("undo_request_edit","Undo the most recent edit in the selected rep+ request editor.",
    {requestId:z.string()},async(args)=>json(await bridge.action("undo",args)));
  server.tool("redo_request_edit","Redo the most recently undone edit in the selected rep+ request editor.",
    {requestId:z.string()},async(args)=>json(await bridge.action("redo",args)));

  server.tool("bulk_replay","Run rep+'s Intruder-style replay engine.",
    {requestId:z.string(),attackType:z.enum(["sniper","battering-ram","pitchfork","cluster-bomb"]),
     positions:z.array(z.object({marker:z.string(),type:z.enum(["simple-list","numbers"]),list:z.array(z.string()).optional(),
       numbers:z.object({from:z.number(),to:z.number(),step:z.number()}).optional()})),concurrency:z.number().int().min(1).max(20).optional()},
    async(args)=>json(await bridge.action("bulk-replay",args)));
  server.tool("control_bulk_replay","Pause, resume, or stop a rep+ bulk replay job.",
    {jobId:z.string(),command:z.enum(["pause","resume","stop"])},async(args)=>json(await bridge.action("bulk-control",args)));

  server.tool("export_workspace","Export the current rep+ workspace.",{},async()=>json(await bridge.action("export-workspace")));
  server.tool("import_workspace","Import a rep+ workspace.",
    {data:z.unknown()},async(args)=>json(await bridge.action("import-workspace",args)));
  server.tool("clear_workspace","Clear rep+ captured/workspace state.",
    {confirm:z.literal(true)},async()=>json(await bridge.action("clear-workspace")));

  server.tool("analyze_attack_surface","Categorize captured requests into security-relevant functional surfaces.",
    {host:z.string().optional(),limit:z.number().int().min(1).max(500).default(50)},
    async(args)=>json(await bridge.action("attack-surface",args)));
  server.tool("capture_evidence","Capture browser-rendered evidence for a request when supported by rep+.",
    {requestId:z.string()},async(args)=>json(await bridge.action("evidence-screenshot",args)));
  server.tool("preview_html","Return rep+'s HTML-preview representation for a captured response.",
    {requestId:z.string()},async(args)=>json(await bridge.action("html-preview",args)));
}
