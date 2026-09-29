# rep+ multi-client MCP skill

Use repplus-codex to inspect traffic captured by rep+ directly. rep+ is the authoritative browser capture/replay workspace; MCP provides structured agent access.

## Passive workflow
1. Start with `repplus_info`, `get_site_map`, or `list_http_history` scoped to the authorized host.
2. Inventory with `list_endpoints`, `list_parameters`, `extract_endpoints`, `extract_parameters`, and `extract_secrets`.
3. Search with `search_http_history` and `search_responses`.
4. Treat `find_reflections` as a lead generator, not a vulnerability verdict.
5. Fetch evidence with `get_http_exchange`; retrieve large bodies progressively with `get_request_body` and `get_response_body`.
6. Correlate with timeline, response history, response comparison, stars/tags and attack-surface analysis.
7. Use rendering, conversion and copy tools for non-mutating inspection.

## Active workflow
Only after authorized active testing is enabled, use replay, blocking/forwarding, workspace mutations, or `bulk_replay`. Bulk modes mirror Rep+: Sniper, Battering Ram, Pitchfork and Cluster Bomb.

## Principles
- Prefer captured evidence over assumptions.
- Keep testing inside the user's authorized scope.
- Distinguish observations, hypotheses and verified findings.
- Do not treat scanner/reflection hits as confirmed vulnerabilities without context.
- Avoid unnecessary disclosure of captured credentials or secrets.
- Prefer bounded retrieval over loading complete histories into model context.
- Keep active operations disabled by default.
