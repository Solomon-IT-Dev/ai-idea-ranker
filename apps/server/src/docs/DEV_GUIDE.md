# Server Development Guide (`apps/server`)

This document is the **source of truth** for how the server must be implemented.
It is written to guide both humans and coding agents (e.g., OpenAI Codex).

---

## 1) Working Agreement for AI Coding Agents

When acting as a coding agent in this repository, follow these rules:

1) **Implement in TypeScript only**. No JavaScript application logic.
2) The server uses **ESM** (`"type": "module"`). In TypeScript files, use ESM imports and keep import paths compatible with ESM (`.../file.js` in source imports when applicable).
3) Follow a **Nest.js-like layered structure** within Express:
   - routes are thin
   - controllers orchestrate request/response
   - services contain business logic
   - repos isolate persistence
   - validators use Zod
   - middlewares are cross-cutting concerns
4) **Comments in code must be English only.**
5) Keep a **single, centralized error handling** path (`AppError` + global error middleware).
6) Enforce Supabase RLS with **Variant B** (request-scoped Supabase client using Anon Key + User JWT).
7) Never log secrets. Authorization headers must be **redacted** from HTTP logs.
8) Imports must be ordered (external first) and auto-fixed on save using `eslint-plugin-simple-import-sort`.
9) If you are unsure about a dependency’s API or behavior, consult the **official documentation** for the exact versions listed below.

---

## 2) Dependency Versions (Exact)

### Root tooling
- Node.js: **>= 20.0.0**
- pnpm: **10.28.0**
- TypeScript: **5.9.3**
- tsx: **4.21.0**
- eslint: **9.39.2**
- prettier: **3.8.0**
- eslint-plugin-simple-import-sort: **12.1.1**

### Server runtime dependencies (`apps/server`)
- express: **5.2.1**
- @types/express: **5.0.6**
- zod: **4.3.5**
- jose: **6.1.3**
- @supabase/supabase-js: **2.90.1**
- pino: **10.2.0**
- pino-http: **11.0.0**
- helmet: **8.1.0**
- cors: **2.8.5**
- compression: **1.8.1**
- hpp: **0.2.3**
- express-rate-limit: **8.2.1**
- dotenv: **17.2.3**

---

## 3) Code Style, Formatting, and Imports

### Prettier (authoritative settings)
Use the following Prettier configuration (do not change unless explicitly requested):

```js
module.exports = {
  printWidth: 80,
  tabWidth: 2,
  semi: false,
  useTabs: false,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'avoid',
  proseWrap: 'always',
}
```

### Import ordering
Imports must be automatically sorted on save. The intended order is:

1) Node built-ins
2) Third-party external dependencies
3) Internal absolute imports (within the app)
4) Relative imports
5) Type-only imports are grouped with their corresponding section

Use `eslint-plugin-simple-import-sort` to enforce this.

---

## 4) High-Level Architecture (Nest-like in Express)

### Design goals
- predictable patterns, low coupling
- fast iteration without sacrificing correctness
- security-aware defaults
- reproducible AI runs (later)

### Required folder conventions

- `src/routes/`
  - `v1.router.ts` — mounts module routers under `/v1`

- `src/modules/<feature>/`
  - `<feature>.routes.ts` — only path wiring + middleware chain + controller wrapper
  - `<feature>.controller.ts` — request handling; parse/validate; call service
  - `<feature>.service.ts` — business logic (pure where possible)
  - `<feature>.repo.ts` — persistence (Supabase queries)
  - `<feature>.validators.ts` — Zod schemas

- `src/middlewares/`
  - `require-auth.middleware.ts` — Supabase JWKS verification (`jose`)
  - `request-id.middleware.ts` — sets `req.requestId` and `x-request-id`
  - `error-handler.middleware.ts` — centralized error responses

- `src/utils/errors/`
  - `app-error.ts` — operational errors (safe to return)

- `src/lib/`
  - `logger.lib.ts` — `pino` and `pino-http` setup; must redact auth header
  - `controller.ts` — controller wrapper used by routes

- `src/config/`
  - `env.schema.ts` — Zod environment schema
  - `env.config.ts` — parses env once and exports typed config

- `src/db/`
  - `supabase.request.ts` — **Variant B** request-scoped client (Anon + user JWT)
  - `supabase.server.ts` — **Admin client** (Service Role); only for system tasks

---

## 5) Core Patterns

### 5.1 Routes must be thin
Routes only:
- mount middlewares
- call `controller(handler)` wrapper

No inline async functions with business logic inside routes.

### 5.2 Controller wrapper
A wrapper such as `controller()` is used to:
- support async controllers
- forward errors to global error handler
- keep route definitions clean

### 5.3 Validation
- Validate request payloads with **Zod**.
- Env variables are validated at startup by `env.config.ts`.

### 5.4 Error Handling
- Operational errors: throw `AppError({ statusCode, errorType, message })`
- Unknown errors: return `unknown_error` with a generic message
- In non-production, the error handler may attach debug details for faster diagnosis.

### 5.5 Request correlation
- Every request gets an `x-request-id` header.
- Error responses must include `requestId`.

---

## 6) Auth & DB (Supabase)

### 6.1 Auth: JWKS verification
- Verify JWT using `jose` with Supabase JWKS endpoint:
  - `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`
- Attach `req.userId = payload.sub`.

**Authorization header format** must be:

```
Authorization: Bearer <ACCESS_TOKEN>
```

Do not use `Bearer:` (with a colon).

### 6.2 DB access: Variant B (mandatory)
To enforce RLS:
- Create a Supabase client per request using
  - `SUPABASE_ANON_KEY`
  - `Authorization: Bearer <user_jwt>` forwarded as a global header

This enables Postgres `auth.uid()` in RLS policies.

### 6.3 Admin client
- `supabase.server.ts` uses `SUPABASE_SERVICE_ROLE_KEY`.
- **Do not use** admin client for user-scoped reads/writes.
- Only allowed for:
  - system tasks / background jobs
  - seeding / migration utilities
  - batch reprocessing where RLS is not applicable

### 6.4 DB schema (manual SQL)

SQL schema changes are stored in `src/db/sql/` and are applied manually in the
Supabase SQL editor.

- Apply in order (once):
  - `src/db/sql/001_projects.sql`
  - `src/db/sql/002_ideas.sql`
  - `src/db/sql/003_playbooks.sql`
  - `src/db/sql/004_playbook_embeddings.sql`
  - `src/db/sql/005_runs.sql`
- Note: these files use `create policy ...` without `if not exists`. Re-running
  them may fail unless you drop existing policies first.

---

## 7) Security Middleware Baseline

- `helmet` (configured for API + cross-origin frontend)
- `cors` (allow all in dev; restrict to `CLIENT_ORIGIN` in prod)
- `hpp`
- `compression`
- `express-rate-limit` applied to `/v1` routes (do not throttle `/health`)

---

## 8) Logging Baseline

- Use `pino-http` middleware.
- Must redact `req.headers.authorization`.
- Structured logs should include `requestId`.

---

## 9) Graceful Shutdown

The entrypoint (`index.ts`) must support graceful shutdown:
- store the `Server` returned from `app.listen(...)`
- close it on `SIGINT` / `SIGTERM`
- keep shutdown idempotent

Closing DB pools is only relevant if a direct DB driver (pg pool, Prisma, etc.) is added later.

---

## 10) Implemented API (current)

### Projects
- `POST /v1/projects`
- `GET /v1/projects/:id`

### Ideas
- `POST /v1/projects/:projectId/ideas:import` — imports ideas from plain text/Markdown.
- `GET /v1/projects/:projectId/ideas?limit=50&offset=0` — lists ideas in a project.
- `PATCH /v1/ideas/:id` — updates `{ title?, rawText?, meta? }` (at least one field).
- `DELETE /v1/ideas/:id`

Ideas import parsing is deterministic and currently treats each non-empty line
as an idea (common list prefixes are removed; Markdown headings are ignored;
case-insensitive duplicates are removed).

### Playbook
- `POST /v1/projects/:projectId/playbook` — upserts playbook markdown and rebuilds chunks.
- `GET /v1/projects/:projectId/playbook` — returns `{ playbook, chunks }`.
- `POST /v1/projects/:projectId/playbook:search` — semantic search over chunks (requires embeddings).

Playbook semantic search uses pgvector + OpenAI embeddings and requires
`OPENAI_API_KEY` to be configured.

### Runs (AI scoring & ranking)
- `POST /v1/projects/:projectId/runs` — creates an AI scoring run and stores `idea_scores`.
- `GET /v1/projects/:projectId/runs/:runId` — returns `{ run, scores }`.

Runs use OpenAI chat for scoring and use playbook retrieval for citations.

---

## 10) Environment Variables

### Required
- `NODE_ENV` = `development | test | production`
- `PORT` = number (local: 8080)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (kept for admin/system tasks)
- `OPENAI_API_KEY` (used later for AI milestones)

### Optional
- `CLIENT_ORIGIN` (URL) — tighten CORS in production

---

## 11) Running Locally

Install:
```bash
pnpm install
```

Run server:
```bash
pnpm dev:server
```

Health:
```bash
curl -i http://localhost:8080/health
```

---

## 12) Getting a Supabase User Token for curl testing

Recommended: create a user via Supabase Dashboard and sign in with password using a small script.

1) Supabase Dashboard → Authentication → Users → Add user (email + password).
2) Add local variables:
   - `TEST_USER_EMAIL`
   - `TEST_USER_PASSWORD`
3) Use a script under `apps/server/scripts/` to print `session.access_token`.

That token is used as:

```bash
-H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 13) Known Endpoints (current)

- `GET /health`
- `GET /v1/auth/me` (requires Bearer token)
- `POST /v1/projects` (requires Bearer token)
- `GET /v1/projects/:id` (requires Bearer token)

---

## 14) Testing

Tests are intentionally postponed until the end. If time remains, add unit tests only for pure logic
(e.g., idea parsing, scoring aggregation, schema validation).
