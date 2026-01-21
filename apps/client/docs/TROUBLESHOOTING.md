# Troubleshooting

## App Fails To Start

The client validates required env vars at startup (`src/shared/lib/env.ts`).

If you see errors like `VITE_API_BASE_URL is required`:
- ensure `apps/client/.env` exists (copy from `apps/client/.env.example`)
- restart the dev server after changing env vars

## Requests Fail In The Browser (CORS)

Symptoms:
- the browser blocks requests before you see a JSON error response
- Network tab shows CORS errors

Checklist:
- `VITE_API_BASE_URL` points to the correct server origin
- in production, set server `CLIENT_ORIGIN` to the deployed client origin (see `docs/DEPLOYMENT.md`)

## 401 / Redirected Back To /auth

Checklist:
- confirm you are signed in (`/auth`)
- refresh the page to re-load the stored session
- if the issue persists, sign out and sign in again (token may be stale)

## SSE Does Not Connect / Stops Early

Symptoms:
- toast: `SSE open failed: <status>` or `SSE connection error.`

Checklist:
- confirm the REST endpoints work first (health, runs list)
- verify the stream URL is reachable:
  - `GET /v1/projects/:projectId/runs/:runId/stream`
- ensure you have a valid session token (SSE requires `Authorization: Bearer <token>`)

## “Database table is missing” / RLS Errors

These errors usually originate from server-side Supabase schema or RLS:
- apply SQL files from `apps/server/src/db/sql/` in the Supabase SQL editor (see server docs)
- ensure the user owns the project rows being queried (RLS)

Use the `requestId` from the error payload to correlate with server logs.
