# repplus-codex

Direct Codex / ChatGPT access to HTTP history captured by rep+ — no Burp Suite, Burp MCP, or third-party proxy bridge required.

## Architecture

```text
Browser traffic
   ↓
rep+ DevTools extension
   ↓
rep+ bridge API
   ↓
repplus-codex MCP server
   ↓
Codex / ChatGPT
```

rep+ remains the capture and replay surface. `repplus-codex` exposes a structured tool interface over rep+'s captured HTTP history so an agent can inspect, search, correlate, and analyze observed traffic.

## Initial tool surface

- `list_http_history`
- `get_request`
- `get_response`
- `search_history`
- `list_endpoints`
- `list_parameters`
- `find_reflections`
- `get_site_map`
- `compare_responses`
- `analyze_history`
- `replay_request` (explicitly enabled; intended for authorized testing)

## Repository layout

- `src/` MCP server implementation
- `src/bridge/` rep+ bridge client and transport contract
- `src/tools/` MCP tool definitions
- `skill/` Codex/ChatGPT agent instructions
- `docs/` protocol and architecture notes

## Status

Early scaffold. The next milestone is wiring the bridge to rep+'s actual internal history storage/message bus and validating the contract against the current rep+ extension.

## Security model

The server is designed for authorized testing. Read-only history access should be the default. Active replay must be explicitly enabled and should be scope-restricted by host.

## Rep+ parity surface

The MCP server now registers the identified rep+ capability surface: capture/history/search, replay, response history, timeline, stars/tags, multi-tab controls, blocking/forwarding, undo/redo, workspace import/export/clear, endpoint/parameter/Kingfisher extraction, attack-surface analysis, Sniper/Battering Ram/Pitchfork/Cluster Bomb bulk replay and job control, response rendering/diffing, converters, copy-as-code, HTML preview and evidence capture.

Browser/state-dependent operations are delegated to `repplus-companion/dispatcher.js`; pure transforms run in the MCP process. The companion must be bound to the exact upstream modules by its host/bootstrap. Features that require browser permissions (notably multi-tab capture and screenshot/evidence functions) remain subject to browser permission/extension APIs.

### Completion semantics

A registered MCP tool is not considered end-to-end complete until the installed rep+ build supplies the corresponding companion dependency and transport. See `docs/FEATURE_PARITY.md` for the parity contract.

## Clients

First-class local MCP targets are Claude Code, Claude Desktop, Codex and other stdio MCP clients. Claude examples live under `config/`; `docs/CLAUDE.md` covers setup and the local-vs-remote security boundary. A Claude Desktop MCPB manifest and packaging script live under `mcpb/` and `scripts/build-mcpb.mjs`.

HTTP history output is progressive: list/search operations omit bodies, individual exchange retrieval includes only previews, and `get_request_body` / `get_response_body` provide bounded chunks with continuation offsets.

The project currently tracks the maintained MCP TypeScript SDK v1 line for broad host interoperability while preserving stdio. The architecture is ready for the split v2 SDK migration; that migration should be performed as a dedicated compatibility change because the v2 registration API and 2026 protocol serving entry points differ from v1.
