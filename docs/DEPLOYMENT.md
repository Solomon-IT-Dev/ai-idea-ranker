# Deployment (Render + Vercel)

This monorepo deploys as:

- Server (`apps/server`) → Render
- Client (`apps/client`) → Vercel

Prereqs:

- Supabase project (Auth + Postgres) with the server SQL schema applied from
  `apps/server/src/db/sql/`
- OpenAI API key (required for embeddings / AI features)

## Server → Render

Render is configured via `render.yaml` at the repo root.

1. In Render: **New +** → **Blueprint**.
2. Select this repository and branch.
3. Render will detect `render.yaml` and create the `web` service.
4. Set production environment variables (do not use `.env` in Render):

- `NODE_ENV=production`
- `PORT` is injected by Render automatically
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `CLIENT_ORIGIN` (your Vercel app origin, e.g. `https://your-app.vercel.app`)

Build/start commands (from `render.yaml`):

- Build: `corepack enable && pnpm install --frozen-lockfile && pnpm -C apps/server build`
- Start: `node apps/server/dist/index.js`

Health check:

- `GET /health`

Notes:

- Render free web services may spin down on inactivity, so first request after idle can be slower.
- CORS is open in development; in production it is restricted by `CLIENT_ORIGIN` (if set).
- API docs are served by the backend: `/docs` (Swagger UI) and `/openapi.json` (OpenAPI spec).

## Client → Vercel

Vercel is configured via:

- `vercel.json` at repo root (recommended monorepo setup), or
- `apps/client/vercel.json` if you set the project root to `apps/client`.

1. Create a Vercel project from this repo.
2. Framework preset: Vite.
3. Set build-time environment variables:

- `VITE_API_BASE_URL` (your Render service URL)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Notes:

- `VITE_*` vars are embedded at build time; changing them requires a redeploy.
- Make sure `CLIENT_ORIGIN` (Render) matches your deployed client origin, otherwise the browser will
  block requests (CORS).

## Post-deploy Checklist

- Server: `GET /health` returns `200`.
- Server docs: `/docs` loads successfully.
- Client can sign in (Supabase) and make authenticated API calls (CORS +
  `Authorization: Bearer <token>`).
