# Streaming (SSE)

Long-running operations (runs and artifact generation) publish progress events. Clients subscribe
to these events via Server-Sent Events (SSE).

## Endpoint

The server exposes an SSE stream per run id under the runs module (see OpenAPI for the exact
path).

Implementation:
- subscription: `src/lib/runStream.lib.ts` (`subscribeToRunStream`)
- controller: `src/modules/runs/runs.controller.ts` (`streamRunController`)

## Behavior

- The server sets `content-type: text/event-stream` and keeps the connection alive.
- A `stream.open` event is sent immediately on subscribe.
- A `run.snapshot` event is sent right after subscribe (useful for reconnects).
- Events are in-memory only (no persistence); a refresh should re-fetch run/artifacts via REST.

## Event Types

Events currently emitted:
- `stream.open`
- `run.snapshot`
- `run.started`
- `idea.scored`
- `plan.progress`
- `run.completed`
- `run.failed`

Payloads are JSON (sent as `data: <json>` per SSE convention).
