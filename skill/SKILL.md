# rep+ Codex / ChatGPT skill

Use the `repplus-codex` MCP tools to inspect HTTP traffic captured by rep+ directly, without requiring Burp Suite or a Burp MCP server.

## Workflow

1. Start with `get_site_map` or `list_http_history` scoped to the user-authorized host.
2. Use `list_endpoints` and `list_parameters` to construct an observed attack-surface inventory.
3. Use `search_http_history` for specific technologies, headers, tokens, routes, or response patterns.
4. Use `find_reflections` only as a lead generator. Reflection by itself is not proof of XSS or another vulnerability.
5. Fetch exact exchanges with `get_http_exchange` before making a finding.
6. Use `compare_responses` for passive comparison of observed behavior.
7. Use `replay_request` only when the user has authorized active testing and replay is explicitly enabled in the local MCP configuration.

## Analysis principles

- Prefer evidence from captured requests/responses over assumptions.
- Correlate related requests across the whole history rather than treating each request independently.
- Distinguish observations, hypotheses, and verified findings.
- Preserve exact request ids so the user can reproduce conclusions in rep+.
- Avoid sending captured secrets to unrelated third parties.
- Keep testing within the user's authorized scope.
