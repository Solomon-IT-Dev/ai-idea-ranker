# Deployment (Railway + Vercel)

This monorepo deploys as:
- Server (`apps/server`) → Railway
- Client (`apps/client`) → Vercel

Prereqs:
- Supabase project (Auth + Postgres) with the server SQL schema applied from `apps/server/src/db/sql/`
- OpenAI API key (required for embeddings / AI features)

## Server → Railway

Railway is configured via `railway.toml` at the repo root.

1) Create a Railway project from this repo.
2) Set **Root Directory** to the repo root (pnpm workspace).
3) Configure a healthcheck: `GET /health`.
4) Set production environment variables (do not use `.env` in Railway):
- `NODE_ENV=production`
- `PORT` (provided by Railway)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `CLIENT_ORIGIN` (your Vercel app origin, e.g. `https://your-app.vercel.app`)

Build/start commands (from `railway.toml`):
- Build: `pnpm -C apps/server build`
- Start: `pnpm -C apps/server start`

Notes:
- CORS is open in development; in production it is restricted by `CLIENT_ORIGIN` (if set).
- API docs are served by the backend: `/docs` (Swagger UI) and `/openapi.json` (OpenAPI spec).

## Client → Vercel

Vercel is configured via:
- `vercel.json` at repo root (recommended monorepo setup), or
- `apps/client/vercel.json` if you set the project root to `apps/client`.

1) Create a Vercel project from this repo.
2) Framework preset: Vite.
3) Set build-time environment variables:
- `VITE_API_BASE_URL` (your Railway service URL)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Notes:
- `VITE_*` vars are embedded at build time; changing them requires a redeploy.
- Make sure `CLIENT_ORIGIN` (Railway) matches your deployed client origin, otherwise the browser
  will block requests (CORS).

## Post-deploy Checklist

- Server: `GET /health` returns `200`.
- Server docs: `/docs` loads successfully.
- Client can sign in (Supabase) and make authenticated API calls (CORS + `Authorization: Bearer <token>`).
