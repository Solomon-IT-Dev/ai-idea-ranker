# AI Idea Ranker (Monorepo)

A small tool to help an R&D team:

- upload/enter a list of PoC ideas (text/markdown)
- define simple constraints (budget, team composition)
- score and rank ideas (impact vs. effort/risk/data readiness)
- produce top picks with rough resource/cost estimates
- generate a clean **30-60-90 day plan**
- generate one **Experiment Card** (problem, hypothesis, dataset, metrics, go/no-go)
- include best-practice tips with **citations** from a short playbook (RAG)

This repo currently focuses on the **server** (`apps/server`). The **client** will be added later and documented separately.

---

## Current Tech Stack (pinned by package versions)

### Runtime / package manager
- Node.js: **>= 20.0.0**
- pnpm: **10.28.0**
- TypeScript: **5.9.3**
- tsx: **4.21.0**

### Server (`apps/server`)
- express: **5.2.1**
- @types/express: **5.0.6**
- zod: **4.3.5**
- jose: **6.1.3** (Supabase JWKS JWT verification)
- @supabase/supabase-js: **2.90.1**
- pino: **10.2.0**
- pino-http: **11.0.0**
- helmet: **8.1.0**
- cors: **2.8.5**
- compression: **1.8.1**
- hpp: **0.2.3**
- express-rate-limit: **8.2.1**
- dotenv: **17.2.3**

### Tooling (root)
- eslint: **9.39.2**
- @eslint/js: **9.39.2**
- typescript-eslint: **8.53.0**
- eslint-config-prettier: **10.1.8**
- eslint-plugin-import: **2.32.0**
- eslint-plugin-simple-import-sort: **12.1.1**
- prettier: **3.8.0**

---

## Architecture Highlights

- TypeScript-only codebase
- Express (ESM) with a **Nest.js-like layered structure**
- Centralized errors via `AppError` + global error middleware
- Request correlation via `x-request-id`
- Supabase Auth via JWKS (`jose`)
- Supabase Postgres with real RLS enforcement via **Variant B**:
  - per-request Supabase client (Anon Key + User JWT)

See `apps/server/src/docs/DEV_GUIDE.md` for the authoritative conventions.

---

## Current Backend Capabilities

- Health: `GET /health`
- Auth: `GET /v1/auth/me` (Supabase JWT verified via JWKS)
- Projects:
  - `POST /v1/projects`
  - `GET /v1/projects/:id`
- Ideas:
  - `POST /v1/projects/:projectId/ideas:import`
  - `GET /v1/projects/:projectId/ideas?limit=50&offset=0`
  - `PATCH /v1/ideas/:id`
  - `DELETE /v1/ideas/:id`
- Playbook:
  - `POST /v1/projects/:projectId/playbook`
  - `GET /v1/projects/:projectId/playbook`
  - `POST /v1/projects/:projectId/playbook:search`
- Runs:
  - `POST /v1/projects/:projectId/runs`
  - `POST /v1/projects/:projectId/runs:execute` (async)
  - `GET /v1/projects/:projectId/runs/:runId`
  - `GET /v1/projects/:projectId/runs/:runId/stream` (SSE)
- Artifacts:
  - `POST /v1/projects/:projectId/runs/:runId/artifacts:generate`
  - `GET /v1/projects/:projectId/runs/:runId/artifacts:latest`
  - `GET /v1/projects/:projectId/runs/:runId/artifacts`

---

## Quick Start (server)

### 1) Install
```bash
pnpm install
```

### 2) Configure environment
Create `apps/server/.env` (or your preferred local env setup). See `apps/server/src/docs/DEV_GUIDE.md` for exact variables.

### 3) Run server
```bash
pnpm dev:server
```

### 4) Health
```bash
curl -i http://localhost:8080/health
```

---

## Planned Client (not yet in repo)

The planned client will be implemented separately and is expected to use:
- Next.js (for React + server capabilities)
- shadcn/ui
- Vercel AI SDK (for streaming UX)

AI provider is **OpenAI**.

---

## Documentation

- `apps/server/src/docs/DEV_GUIDE.md` — server architecture, conventions, local development
- `apps/server/src/docs/ROADMAP.md` — backend milestones to complete the MVP

---

## Notes

Root scripts currently point `dev:client` to the server as a placeholder. When the client is added, update it to `apps/client`.
