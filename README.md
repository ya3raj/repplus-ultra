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
