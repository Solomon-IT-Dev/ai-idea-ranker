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
  - body: `{ ideas: [{ title?, text }] }` (text/markdown)
  - server must enforce that imported ideas cannot be inserted into other owner project (projectId
    scoping + RLS)
- `GET /v1/projects/:projectId/ideas`
- `PATCH /v1/projects/:projectId/ideas/:ideaId`
- `DELETE /v1/projects/:projectId/ideas/:ideaId`

## Playbook

- `POST /v1/projects/:projectId/playbook`
  - body: `{ text }` (text/markdown)
  - server chunks + embeds (pgvector) using `text-embedding-3-small`
- `GET /v1/projects/:projectId/playbook` (status/chunks summary)
- Retrieval endpoint exists server-side for RAG (used internally and optionally exposed).

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
