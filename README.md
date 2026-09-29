# RepPlus Ultra

Multi-client MCP access to HTTP traffic and security-analysis capabilities captured by rep+. No Burp Suite or Burp MCP dependency is required.

## Architecture

```text
Browser traffic → rep+ DevTools extension → loopback companion/broker → repplus-ultra MCP → Claude / Codex / compatible MCP hosts
```

rep+ remains authoritative for browser capture, replay and workspace state. The MCP server exposes that state to agents while keeping passive analysis the default.

## Capabilities

History listing/search, exact exchange retrieval, bounded request/response body reads, site maps, endpoint/parameter/reflection analysis, native endpoint/parameter/Kingfisher extractors, response search/history/diff/rendering, timeline, stars/tags, capture and multi-tab controls, blocking/forwarding, undo/redo, workspace import/export/clear, attack-surface analysis, evidence/HTML preview, conversions, copy-as-code, request replay, and Sniper/Battering Ram/Pitchfork/Cluster Bomb bulk replay with job controls.

See `docs/FEATURE_PARITY.md` for the Rep+ parity contract.

## Clients

- Claude Code: project configuration in `.mcp.json` and `config/claude-code.mcp.json`.
- Claude Desktop: configuration in `config/claude-desktop.json`; MCPB packaging lives under `mcpb/`.
- Codex/ChatGPT and other MCP hosts: use the same stdio MCP server where local MCP is supported.

## Build and test

```sh
npm install
npm run build
npm test
```

For a Claude Desktop bundle:

```sh
npm run pack:mcpb
```

## Security defaults

The extension broker binds to `127.0.0.1`. Set `REPPLUS_BRIDGE_TOKEN` to authenticate extension/broker traffic. Active network/workspace mutations are disabled unless `REPPLUS_ALLOW_ACTIVE=1` (or `true`) is explicitly configured. Do not expose the loopback broker as a public remote MCP endpoint.

Large HTTP bodies are retrieved progressively: history/search omit bodies, exchange retrieval returns bounded previews, and `get_request_body` / `get_response_body` return chunks with continuation offsets.

## Repository layout

- `src/` MCP server, bridge and tools
- `repplus-companion/` Rep+ browser-side dispatcher/bootstrap/transport
- `config/` client configuration examples
- `mcpb/` Claude Desktop MCP Bundle manifest
- `skill/` agent usage guidance
- `docs/` architecture, parity and client documentation
- `test/` transforms, bounded-output, broker and MCP interoperability tests


## Acknowledgements

### Special thanks to rep+

RepPlus Ultra exists because of **rep+**, the open-source Chrome DevTools HTTP request manipulation and security-testing project created by **Bour Abdelhadi (@bscript)**. The original idea, browser-native HTTP analysis workflow, and much of the capability model that inspired RepPlus Ultra come from rep+.

RepPlus Ultra extends that workflow to MCP-compatible AI clients such as Claude, Codex and ChatGPT — and we want the origin of the idea to be clear. Huge thanks to Bour Abdelhadi and the rep+ project for building and open-sourcing the foundation and inspiration behind this project.

Upstream project: https://github.com/repplus/rep-chrome

## Status

The TypeScript build and stdio MCP interoperability suite pass in CI. Browser-dependent capabilities still require a Rep+ extension build containing the companion integration and the relevant browser permissions; those cannot be simulated by the Node-only CI job.
