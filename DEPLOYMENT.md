# Deployment (Railway + Vercel)

This repo is a **pnpm monorepo**:
- Server: `apps/server` (Express API)
- Client: `apps/client` (Vite React SPA)

## Server → Railway

### Railway project setup
1. Create a new Railway project from this GitHub repo.
2. Set the **Root Directory** to the repo root (recommended for pnpm workspaces).
3. Railway will use `railway.toml` at repo root:
   - build: `pnpm -C apps/server build`
   - start: `pnpm -C apps/server start`
4. Healthcheck endpoint: `GET /health`

### Required environment variables
Set these in Railway (no `.env` files in production):
- `NODE_ENV=production`
- `PORT` (Railway sets this automatically; don’t hardcode)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `CLIENT_ORIGIN` (your Vercel app origin, e.g. `https://your-app.vercel.app`)

### Notes
- CORS is permissive in dev, but in production it uses `CLIENT_ORIGIN` (if set).
- OpenAPI UI is exposed by the server (see `/openapi` routes).

### Current deployment
- Base URL: `https://appsserver-production-d740.up.railway.app`
- Healthcheck: `https://appsserver-production-d740.up.railway.app/health`
- Swagger UI: `https://appsserver-production-d740.up.railway.app/docs`

## Client → Vercel

### Vercel project setup
1. Create a new Vercel project from this GitHub repo.
2. Set **Framework Preset**: Vite.
3. Choose one of these options:
   - **Recommended (monorepo)**: keep project root as the repo root. Vercel will use `vercel.json` at repo root.
   - **Alternative**: set project root to `apps/client`. Vercel will use `apps/client/vercel.json`.
4. The Vercel config sets:
   - build command: `pnpm -C apps/client build`
   - output directory: `apps/client/dist`
   - SPA rewrite: all routes → `/index.html` (for React Router)

### Required environment variables (build-time)
Set these in Vercel:
- `VITE_API_BASE_URL` = your Railway service URL (e.g. `https://appsserver-production-d740.up.railway.app`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Notes
- `VITE_*` vars are embedded at build time. After changing them, redeploy.

### Current deployment
- App URL: `https://ai-idea-ranker.vercel.app/`
