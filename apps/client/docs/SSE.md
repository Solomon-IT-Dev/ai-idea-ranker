# Streaming (SSE)

Long-running server operations stream progress via Server-Sent Events (SSE). The client uses SSE
to provide immediate feedback while a run is executing and while artifacts are being generated.

## Implementation

- Hook: `src/features/runStream/model/runStream.hooks.ts` (`useRunStream`)
- Transport: `@microsoft/fetch-event-source`

The hook:
- reads the current Supabase session token
- opens an `EventSource`-like connection with `Authorization: Bearer <token>`
- appends events to a local log (`events`) and exposes `lastEvent`
- stops streaming after terminal events (`run.completed` / `run.failed`)

## Event Types

Known events:
- `run.started`
- `run.sources_ready` (optional)
- `idea.scored`
- `plan.progress`
- `run.completed`
- `run.failed`

Unknown event types are captured as `type: 'unknown'` and can be ignored or logged by the UI.

## UI Conventions

- Treat SSE as progress telemetry: after completion, refresh state via REST (React Query).
- Prefer explicit refresh over implicit retries (the hook throws in `onerror` to stop auto-retry).
