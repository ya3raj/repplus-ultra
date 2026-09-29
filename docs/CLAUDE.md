# Claude support

repplus-codex is a local stdio MCP server, which is the appropriate transport for Claude Code and local Claude Desktop MCP integrations. The server keeps captured traffic local and talks to the rep+ extension through a loopback-only broker.

## Claude Code

Build the project, copy `config/claude-code.mcp.json` to `.mcp.json` in the project that should use rep+, and replace the absolute server path. Keep active operations disabled until explicitly required.

## Claude Desktop

Use `config/claude-desktop.json` as the `mcpServers` entry in Claude Desktop's MCP configuration, or package the project as an MCPB/Desktop Extension in a distribution build.

## Cloud Claude / remote connectors

Do not expose the loopback extension broker publicly. Claude remote connectors originate from Anthropic infrastructure and require a publicly reachable remote MCP endpoint. A future remote gateway should authenticate clients and forward only explicitly selected/sanitized traffic; the browser broker remains loopback-only.

## Output discipline

History-list tools omit request/response bodies by default. Use `get_http_exchange` for metadata plus previews and `get_response_body` / `get_request_body` for bounded chunks. This avoids flooding Claude's context with an entire HTTP history.
