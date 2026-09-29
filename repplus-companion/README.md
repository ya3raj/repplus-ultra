# rep+ companion integration

This directory is the rep+-side half of the integration. It is designed to be copied/merged into rep+ or maintained as a very small companion patch.

## Why this lives beside rep+

Chrome DevTools network objects, response bodies, request workspace state, stars/tags, blocking queues, bulk replay jobs, and Kingfisher extraction belong to rep+. The companion calls those native modules directly and exposes a versioned local bridge.

It must not scrape the rep+ UI.

## Required dependency bindings

The bootstrap should provide:

- `state` from `js/core/state/index.js`
- `actions` from `js/core/state/actions.js`
- endpoint/parameter/secret extractor functions from `js/features/extractors/*`
- bulk replay controller/engine
- workspace import/export helpers
- capture/multi-tab settings
- the rep+ extension version

## Transport

The transport is deliberately separate from `agent-bridge.js`. Browser extensions cannot safely assume they may bind an arbitrary TCP listener. Production transport should use a browser-supported native messaging/companion mechanism or another explicitly installed localhost component. The MCP server's HTTP transport remains useful for development and for a native companion process.

Do not expose the bridge on non-loopback interfaces by default.
