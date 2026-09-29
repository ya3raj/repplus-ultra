# Rep+ bridge protocol

The MCP process does not read browser internals directly. A tiny rep+ companion bridge exposes the extension's existing captured history on loopback.

Default base URL: `http://127.0.0.1:8765`

## Endpoints

### `GET /v1/history`

Optional query parameters: `host`, `method`, `status`, `text`, `limit`, `offset`.

Returns an array of HTTP exchanges:

```json
[
  {
    "request": {
      "id": "req-123",
      "timestamp": "2026-09-30T03:00:00.000Z",
      "method": "GET",
      "url": "https://example.test/api/me?view=full",
      "host": "example.test",
      "path": "/api/me",
      "headers": {"accept":"application/json"}
    },
    "response": {
      "requestId": "req-123",
      "status": 200,
      "headers": {"content-type":"application/json"},
      "body": "{\"id\":1}",
      "durationMs": 42
    }
  }
]
```

### `GET /v1/history/:id`

Returns one exchange or `404`.

### `POST /v1/history/:id/replay`

Accepts optional replacements for `method`, `url`, `headers`, and `body`. The MCP side refuses to call this endpoint unless `REPPLUS_ALLOW_REPLAY=1` is set.

## Authentication

If `REPPLUS_BRIDGE_TOKEN` is configured, the MCP client sends `Authorization: Bearer <token>`. The bridge implementation should require the same token and should bind only to loopback by default.

## Design constraints

1. Read-only history access is the default.
2. Replays are opt-in.
3. The bridge should expose rep+'s canonical request ids rather than creating an independent traffic database.
4. Secrets should remain local; the bridge must not emit telemetry by default.
5. Large bodies should eventually support truncation/range retrieval so agents can progressively inspect history without loading everything at once.
