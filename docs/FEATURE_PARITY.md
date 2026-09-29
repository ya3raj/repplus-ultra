# rep+ feature parity matrix

Upstream reference: `repplus/rep-chrome`.

The plugin is built on rep+. rep+ remains the browser capture/replay engine and workspace; this project exposes those capabilities to Codex/ChatGPT.

## Required parity

| rep+ capability | Agent surface | Layer |
|---|---|---|
| HTTP capture/history | list/get/search history | bridge |
| Multi-tab capture | capture settings/status | bridge |
| Replay/edit request | replay_request | bridge |
| Request/response history | response_history | bridge |
| Page/domain/root grouping | site_map/group_history | MCP |
| Timeline | timeline | bridge/MCP |
| Stars and color tags | star/tag/filter | bridge |
| Filters + regex | search_history | bridge |
| Block/forward | blocking controls | bridge |
| Clear workspace | clear_workspace | bridge |
| JSON import/export | import/export workspace | bridge |
| Raw/Pretty/Hex | render_response | MCP |
| Base64/URL/JWT/Hex converters | convert_value | MCP |
| Copy as curl/PowerShell/Python/fetch | copy_request_as | MCP |
| Undo/redo | undo_request/redo_request | bridge |
| Sniper/Battering Ram/Pitchfork/Cluster Bomb | bulk_replay | bridge |
| Pause/resume bulk replay | bulk job controls | bridge |
| Response diff | compare_responses | MCP |
| Kingfisher secret scanner | extract_secrets | bridge |
| Endpoint extractor | extract_endpoints | bridge |
| Parameter extractor/risk | extract_parameters | bridge |
| Response search | search_responses | bridge |
| Attack Surface | analyze_attack_surface | MCP/agent |
| AI per-request context | agent conversation context | client |
| Cross-request references | get_related_context | MCP |
| AI request modifications | propose/apply request edit | MCP + bridge |
| Screenshot editor | capture_evidence | bridge |
| HTML preview | preview metadata/content | bridge |

## Principle

Do not independently reimplement functionality that depends on Chrome DevTools state when rep+ already owns that state. Expose the upstream state/action through the bridge. Pure transforms such as encoding, formatting, diffing, and inventory aggregation may run in the MCP process.
