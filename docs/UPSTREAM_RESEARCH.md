# Upstream research notes

The current rep+ Chrome source is modular. Important implementation boundaries:

- `js/network/capture.js`: DevTools capture, response-body collection, replay parsing/execution.
- `js/network/multi-tab.js`: optional multi-tab capture.
- `js/core/state/*`: requests, filters, history, undo/redo, bulk replay, diff, starring, timeline, attack-surface and blocking state.
- `js/features/bulk-replay/engine.js`: Sniper, Battering Ram, Pitchfork and Cluster Bomb generation.
- `js/features/extractors/*`: endpoints, parameters and Kingfisher-backed secrets.
- `js/features/attack-surface/index.js`: attack-surface categorization.
- `js/features/ai/*` and `js/features/llm-chat/*`: provider AI and cross-request context.
- `js/search/index.js`: request/response search.
- `js/network/request-sender.js`: request execution.

## Integration direction

The rep+ companion bridge should call the same state/actions and feature modules used by the UI. It must not scrape the DOM. This keeps Codex-visible state consistent with what the tester sees in rep+.

The bridge protocol is versioned so Chrome and Firefox implementations can expose the same agent API.
