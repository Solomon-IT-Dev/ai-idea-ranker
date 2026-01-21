# AI Idea Ranker — Client (React SPA)

Frontend for AI Idea Ranker. A Vite-powered React SPA that:
- authenticates via Supabase on the client
- calls the server via REST (JSON)
- uses SSE for streaming progress for long-running AI operations
- renders generated artifacts as Markdown (with citations)

## Table of Contents

- [Local Development](#local-development)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Docs](#docs)

## Local Development

From the repo root:

1) Install deps:
```bash
pnpm install
```

2) Configure env:
- copy `apps/client/.env.example` → `apps/client/.env`

3) Run:
```bash
pnpm dev:client
```

4) Open:
- `http://localhost:3000`

## Configuration

Client env vars (see `apps/client/.env.example`):
- `VITE_API_BASE_URL` (e.g. `http://localhost:8080`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Notes:
- `VITE_*` vars are embedded at build time (Vercel: redeploy after changes).
- Supabase **anon** key is safe to expose in client apps; never expose Service Role keys.

## Architecture

High-level structure (FSD-lite):
`shared → entities → features → pages → app`

Details live in `apps/client/docs/ARCHITECTURE.md`.

## Deployment

Vercel deployment notes are in `docs/DEPLOYMENT.md` (repo root).

## Docs

Start here: `apps/client/docs/README.md`.
