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


## Verified platform model

Anthropic documents local MCP servers for Claude Code and Claude Desktop. Claude Code can add a local server with `claude mcp add <name> <command> [args...]`. Claude Desktop can install packaged local servers as MCP Bundles (`.mcpb`).

The local Rep+ browser broker is intentionally not a remote MCP endpoint. For cloud-hosted clients, deploy a separately authenticated Streamable HTTP MCP gateway; never publish the loopback extension broker itself.

## Protocol roadmap

The current release uses the mature MCP TypeScript v1 server API over stdio for broad host compatibility. MCP TypeScript SDK v2 is now the stable 2026 protocol line and supports dual-era stdio via `serveStdio(factory)`. Migration should preserve 2025-era clients while enabling the 2026-07-28 protocol rather than dropping legacy clients.
