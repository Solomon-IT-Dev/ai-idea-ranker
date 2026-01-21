# Troubleshooting

## Server Exits On Startup

The server validates environment variables at startup (`src/config/env.config.ts`).

Checklist:
- copy `apps/server/.env.example` → `apps/server/.env`
- set required variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `OPENAI_API_KEY`

## “Database table is missing. Did you run migrations?”

This typically means the Supabase SQL schema was not applied.

Checklist:
- apply SQL files from `apps/server/src/db/sql/` in order (Supabase SQL editor)

## 401 “Invalid or expired token”

Checklist:
- ensure the client sends `Authorization: Bearer <access_token>`
- refresh the Supabase session on the client
- if using curl, generate a fresh token via `apps/server/scripts/getToken.script.ts`

## CORS Errors In The Browser

Checklist:
- in production, set `CLIENT_ORIGIN` to your deployed client origin (see `docs/DEPLOYMENT.md`)

## SSE Stream Does Not Connect

Checklist:
- the stream endpoint requires auth (same `Authorization` header)
- verify SSE is not being buffered/compressed by a proxy (server sets `x-accel-buffering: no` and
  disables compression for `/stream`)
