# Server Development Guide

This document is the server-side “how we work” reference: how to run locally and the conventions
that keep the backend predictable.

For architecture and deeper details, start with `apps/server/docs/README.md`.

## Local Development

From the repo root:

1) Install:
```bash
pnpm install
```

2) Configure environment:
- copy `apps/server/.env.example` → `apps/server/.env`

3) Apply Supabase SQL schema (once per Supabase project):
- apply files from `apps/server/src/db/sql/` in order (Supabase SQL editor)

4) Run:
```bash
pnpm dev:server
```

5) Verify:
- Health: `http://localhost:8080/health`
- Swagger UI: `http://localhost:8080/docs`
- OpenAPI JSON: `http://localhost:8080/openapi.json`

## Environment Variables

Required (see `apps/server/.env.example`):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (system/admin tasks only)
- `OPENAI_API_KEY` (required at startup; used for embeddings/AI flows)

Common:
- `NODE_ENV` (`development | staging | production`)
- `PORT` (defaults to `8080`)
- `CLIENT_ORIGIN` (optional; tighten CORS in production)

## Conventions

- TypeScript only, ESM modules.
- Layered structure: routes → controllers → services → repos → validators.
- Inputs are validated with Zod at module boundaries.
- Errors flow through a single global error handler and include `requestId` (see
  `apps/server/docs/ERRORS.md`).
- User-scoped DB access uses an RLS-enforced, request-scoped Supabase client (see
  `apps/server/docs/DATABASE.md`).

## Getting A Supabase User Token (curl/Postman)

- set `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` in `apps/server/.env`
- run the helper script:
```bash
pnpm -C apps/server tsx scripts/getToken.script.ts
```

Use the printed token as:
`Authorization: Bearer <ACCESS_TOKEN>`
