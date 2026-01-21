# AI Idea Ranker (Monorepo)

AI Idea Ranker is a lightweight app for capturing product/PoC ideas, enriching them with
AI-generated insights, and ranking them to decide what to build next.

At a glance:

- import ideas (plain text / Markdown)
- add project constraints (budget, team)
- score & rank ideas (impact vs effort/risk/data readiness)
- stream long-running AI operations (SSE)
- generate artifacts: **30/60/90 plan** and an **Experiment Card** (with citations from a playbook
  via RAG)

## Table of Contents

- [Repo Layout](#repo-layout)
- [Key Concepts](#key-concepts)
- [Architecture Highlights](#architecture-highlights)
- [Live Demo](#live-demo)
- [Quick Start (Local)](#quick-start-local)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Docs Index](#docs-index)
- [Root Scripts](#root-scripts)

## Repo Layout

- Server: `apps/server` — Express API (TypeScript, ESM)
- Client: `apps/client` — React SPA (Vite, TypeScript)

## Key Concepts

- Project: the unit of work; includes constraints (budget/team).
- Ideas: imported as text/Markdown and stored per project.
- Playbook: a short internal guide uploaded per project; used as retrieval context for citations.
- Run: a scoring & ranking execution (long-running; streamed to the client via SSE).
- Artifacts: generated outputs (30/60/90 plan, Experiment Card) versioned per run.

## Architecture Highlights

- Monorepo with shared conventions; app-level implementation details live in `apps/*/docs/`.
- Auth: Supabase on the client; the server validates JWTs per request (JWKS).
- Data access: Supabase Postgres with RLS enforced via request-scoped clients (Variant B).
- Long-running AI operations are streamed via SSE for responsive UX.

## Live Demo

- Client (Vercel): `https://ai-idea-ranker.vercel.app/`
- Server (Railway): `https://appsserver-production-d740.up.railway.app` (`/health`)
- Server Swagger UI: `https://appsserver-production-d740.up.railway.app/docs`

## Quick Start (Local)

Prereqs: Node.js `>= 20` + `pnpm`.

1. Install dependencies:

```bash
pnpm install
```

2. Configure env files:

- Server: copy `apps/server/.env.example` → `apps/server/.env`
- Client: copy `apps/client/.env.example` → `apps/client/.env`

3. Prepare Supabase DB schema (once per Supabase project):

- Apply SQL files from `apps/server/src/db/sql/` in order in the Supabase SQL editor (see
  `apps/server/docs/DATABASE.md`)

4. Ensure required external services are configured:

- Supabase project is required (Auth + Postgres).
- OpenAI API key is currently required for the server to start (env validation), and is used for
  embeddings/AI flows.

5. Run in two terminals:

```bash
pnpm dev:server
pnpm dev:client
```

6. Verify:

- Client: `http://localhost:3000`
- Server health: `http://localhost:8080/health`
- Swagger UI: `http://localhost:8080/docs`

## Deployment

See `docs/DEPLOYMENT.md` for Railway (server) + Vercel (client) setup, required environment
variables, and post-deploy checks.

## API Documentation

- Swagger UI: `/docs`
- OpenAPI JSON: `/openapi.json`

If you need behavioral conventions beyond the spec, see `apps/server/docs/API.md`.

## Docs Index

- Deployment: `docs/DEPLOYMENT.md`
- Server:
  - `apps/server/README.md` (service overview and local run)
  - `apps/server/docs/README.md` (knowledge base index: architecture, auth, DB, SSE, errors, security)
  - `apps/server/docs/TROUBLESHOOTING.md` (common issues and checklists)
- Client:
  - `apps/client/README.md` (app overview and local run)
  - `apps/client/docs/README.md` (knowledge base index: architecture, routing, auth, state/data, SSE, errors, UI, troubleshooting)
  - `apps/client/docs/TROUBLESHOOTING.md` (common issues and checklists)

## Root Scripts

- `pnpm dev:server` — run API (port `8080` by default)
- `pnpm dev:client` — run SPA (Vite dev server)
- `pnpm lint` — lint the repo
- `pnpm format` — format the repo
