# API Contract (Client → Server)

The server is an Express API using Supabase JWT auth. All requests use:

`Authorization: Bearer <token>`

Base: `VITE_API_BASE_URL` (e.g. `http://localhost:8080`)

## Projects

- `POST /v1/projects`
  - body: `{ name, constraints: { budget, team: { fe, be, ds? } } }`
- `GET /v1/projects`
- `GET /v1/projects/:projectId`

## Ideas

- `POST /v1/projects/:projectId/ideas:import`
  - body: `{ text }` (text/markdown; server parses into ideas)
  - response: `{ insertedCount, ideas, truncated }`
- `GET /v1/projects/:projectId/ideas`
  - query: `limit?`, `offset?`
  - response: `{ ideas, limit, offset }`
- `PATCH /v1/ideas/:id`
  - body: `{ title?, rawText?, meta? }` (at least one field)
  - response: `{ idea }`
- `DELETE /v1/ideas/:id`
  - response: `204 No Content`

## Playbook

- `POST /v1/projects/:projectId/playbook`
  - body: `{ title, content }` (markdown)
  - response: `{ playbook, chunksInserted, embeddings: { status, errorType? } }`
- `GET /v1/projects/:projectId/playbook` (status/chunks summary)
  - response: `{ playbook, chunks }` where `playbook.content_markdown` is present
- `POST /v1/projects/:projectId/playbook:search`
  - body: `{ query, topK?, includeText? }`
  - response: `{ query, topK, results: [{ chunkId, chunkIndex, title, score, text? }] }`

## Runs (Scoring)

Two modes:

1. Non-streaming create & execute in one request:

- `POST /v1/projects/:projectId/runs` → returns completed run + top scores

2. Streaming mode:

- `POST /v1/projects/:projectId/runs:execute` → returns `{ run }` (202 Accepted)
- `GET /v1/projects/:projectId/runs/:runId/stream` → SSE stream

Other:

- `GET /v1/projects/:projectId/runs/:runId` → run + scores (refresh after streaming)

SSE events:

- `run.started`
- `run.sources_ready` (optional)
- `idea.scored`
- `run.completed`
- `run.failed`

## Artifacts (30-60-90 plan + Experiment Card)

- `POST /v1/projects/:projectId/runs/:runId/artifacts:generate`
  - body: `{ topN }`
  - generates:
    - `plan_30_60_90` (markdown)
    - `experiment_card` (markdown)
  - also streams `plan.progress` when SSE is connected

- `GET /v1/projects/:projectId/runs/:runId/artifacts`
  - returns **all versions** grouped by type

Notes:

- Artifacts must be rendered as markdown on the client.
- Citations must reference playbook chunks.
