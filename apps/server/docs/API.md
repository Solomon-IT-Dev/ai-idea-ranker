# API Integration Notes

The authoritative API reference is the server OpenAPI spec / Swagger UI:
- Swagger UI: `GET /docs`
- OpenAPI JSON: `GET /openapi.json`

This document captures a few integration conventions that the client relies on.

## Auth Header

Protected requests expect:
`Authorization: Bearer <ACCESS_TOKEN>`

## Error Shape

Error responses use a stable JSON shape:
```json
{ "status": "fail|error", "errorType": "string", "message": "string", "requestId": "string", "debug": {} }
```

Notes:
- `requestId` is included in error responses for log correlation.
- `debug` is only included outside production.

## List Responses

For collection endpoints, the API returns `200` with an empty array when there are no results (not
`404`). Responses prefer stable shapes (e.g. `{ projects: [] }`) to simplify client empty states.

## Projects

The project delete endpoint is a **cascade delete** (implemented via DB foreign keys):
- `DELETE /v1/projects/:id` — deletes the project and related data (ideas, runs, playbook, chunks, artifacts, scores).

Note: this requires RLS `DELETE` policies on `projects`, `runs`, `artifacts`, and `idea_scores` (see `apps/server/src/db/sql/007_delete_policies.sql`).

## Streaming (SSE)

Long-running operations stream progress via SSE (`text/event-stream`).

Events currently emitted include:
- `stream.open`, `run.snapshot`, `run.started`, `idea.scored`, `plan.progress`, `run.completed`, `run.failed`
