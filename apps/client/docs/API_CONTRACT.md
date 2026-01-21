# API Integration (Client → Server)

This doc describes conventions the client relies on (auth header, error shape, SSE events). The
authoritative API reference is the server OpenAPI spec / Swagger UI:
- Swagger UI: `GET /docs`
- OpenAPI JSON: `GET /openapi.json`

## Base URL

Configured via `VITE_API_BASE_URL` (e.g. `http://localhost:8080`).

## Auth

All protected requests include:
`Authorization: Bearer <Supabase access token>`

The token is sourced from the Supabase session:
- initial: `supabase.auth.getSession()`
- updates: `supabase.auth.onAuthStateChange(...)`

## Error Shape

When the server returns JSON errors, the client expects:
```json
{ "status": "fail|error", "errorType": "string", "message": "string", "requestId": "string", "debug": {} }
```

Notes:
- `debug` is only present outside production.
- `requestId` can be surfaced in the UI/logs for faster troubleshooting and server log correlation.

## Streaming (SSE)

SSE is used to stream progress for long-running runs / artifact generation.

Conventions:
- Client must send `Authorization` header (SSE does not reuse browser cookies for this flow).
- The UI treats these as known events (additional event types may appear and should be ignored/logged):
  - `run.started`
  - `run.sources_ready` (optional)
  - `idea.scored`
  - `plan.progress`
  - `run.completed`
  - `run.failed`

## Artifacts Rendering

Artifacts are returned as Markdown and must be rendered safely on the client.

Expectations:
- show latest artifacts and allow viewing historical versions
- render citations (playbook chunk references) as part of the Markdown output
