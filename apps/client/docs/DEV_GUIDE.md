# Client Development Guide

This document is the client-side “how we work” reference: architecture rules, integration
patterns, and conventions that keep the codebase predictable.

## Principles

- React SPA (Vite) with React Router.
- Server state is managed via React Query.
- Networking uses a shared fetch wrapper (`src/shared/api/http.ts`) with a consistent error shape.
- Streaming progress uses SSE (`@microsoft/fetch-event-source`).
- UI uses shadcn/ui + Tailwind, with consistent loading/empty/error states.
- Auth uses the Supabase session on the client; requests include `Authorization: Bearer <token>`.
- Code comments (if any) are English only.

Dependencies are defined in `apps/client/package.json` (this guide intentionally does not pin
versions).

## Networking

### Base URL
`VITE_API_BASE_URL` (e.g., `http://localhost:8080`)

### Authorization
Every authenticated request must include:

`Authorization: Bearer <Supabase access token>`

The token comes from Supabase session:
- initial: `supabase.auth.getSession()`
- updates: `supabase.auth.onAuthStateChange(...)`

### Fetch Wrapper
Implemented in `src/shared/api/http.ts`:
- adds Authorization header if token exists
- handles JSON request/response
- parses backend error shape:
  - `{ status, errorType, message, requestId, debug? }`
- throws a typed `ApiError` for React Query to handle

Important:
- For JSON requests, use `apiFetch(path, { method, json: {...} })` (sets `content-type:
  application/json`).
- Do not pass JSON as `body` directly; otherwise the server may treat `req.body` as `undefined` and
  validation will fail.

### React Query
- Use stable query keys (`['projects']`, `['project', projectId]`, etc.)
- Invalidate after mutations
- Prefer `enabled` gating to prevent calls without required params/token

## Streaming (SSE)

Streaming is implemented via `@microsoft/fetch-event-source` in
`src/features/runStream/model/runStream.hooks.ts`.

Conventions:
- Always include `Authorization: Bearer <token>`.
- Close streams on unmount and stop auto-retries (prefer explicit refresh).
- Known event types include: `run.started`, `idea.scored`, `plan.progress`, `run.completed`,
  `run.failed` (plus optional `stream.open`, `run.snapshot`, `run.sources_ready`).

## UI / UX Guidelines

- Use shadcn components and consistent spacing.
- Always include:
  - loading state
  - empty state
  - error state (toast + inline message)
- Use `sonner` to toast success/errors.
- Render artifacts markdown via `react-markdown` + `remark-gfm`.

### react-hook-form + shadcn wrappers
- Any shared inputs used with `react-hook-form` `register()` must forward refs (`React.forwardRef`) and pass through standard props. Otherwise `setValue()` / reset / focus may not update the DOM.
