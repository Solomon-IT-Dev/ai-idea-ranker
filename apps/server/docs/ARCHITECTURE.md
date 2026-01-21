# Server Architecture

The server is an Express API implemented in TypeScript (ESM). The codebase follows a layered,
Nest-like structure to keep routes thin and business logic testable.

## Folder Layout

```
src/
  app.ts
  routes/
    v1.router.ts                  # mounts module routers under /v1
  modules/<feature>/
    <feature>.routes.ts           # route wiring + middleware chain
    <feature>.controller.ts       # request/response orchestration
    <feature>.service.ts          # business logic
    <feature>.repo.ts             # persistence (Supabase queries)
    <feature>.validators.ts       # Zod schemas for inputs
  middlewares/
    requestId.middleware.ts       # sets req.requestId + x-request-id
    requireAuth.middleware.ts     # JWKS verification, sets req.userId
    errorHandler.middleware.ts    # centralized error responses
  lib/
    controller.lib.ts             # async controller wrapper
    runStream.lib.ts              # in-memory SSE stream per run
    logger.lib.ts                 # pino + pino-http (auth header redaction)
  config/
    env.schema.ts                 # Zod env schema
    env.config.ts                 # parses env once and exports typed config
  db/
    supabase.request.ts           # request-scoped client (RLS enforced)
    supabase.server.ts            # admin client (service role) for system tasks only
```

## Boundaries

- `routes/*` is wiring only (mount routers, no business logic).
- `modules/*` contains the full vertical slice for a feature.
- `service` orchestrates business logic and external calls (OpenAI, chunking, scoring, etc.).
- `repo` is the only layer that talks to Supabase tables directly.
- `validators` define request schemas; controllers parse and validate inputs before calling services.

## Cross-Cutting Concerns

- Request correlation: `x-request-id` is attached to every request and is included in error
  responses.
- Centralized errors: services/controllers throw `AppError`; everything else is normalized by the
  global error handler.
- Streaming: long-running operations publish run events; clients subscribe via SSE.
