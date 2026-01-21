# AI Idea Ranker — Server (Express API)

TypeScript (ESM) API for AI Idea Ranker.

## What This Service Does

- validates Supabase JWT per request (JWKS)
- persists data in Supabase Postgres with RLS enforced (request-scoped client)
- runs long-running AI workflows (scoring, artifacts) and streams progress via SSE
- serves API documentation (Swagger UI + OpenAPI)

## Local Development

From the repo root:

1) Create env file:
- copy `apps/server/.env.example` → `apps/server/.env`

2) Apply DB schema (once per Supabase project):
- apply SQL files from `apps/server/src/db/sql/` in order in the Supabase SQL editor

3) Run:
```bash
pnpm dev:server
```

4) Verify:
- Health: `http://localhost:8080/health`
- Swagger UI: `http://localhost:8080/docs`
- OpenAPI JSON: `http://localhost:8080/openapi.json`

## Docs

- Start here: `apps/server/docs/README.md`
