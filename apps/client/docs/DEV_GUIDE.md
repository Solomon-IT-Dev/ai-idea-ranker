# Client Dev Guide (Agent Context)

This document provides **strict rules and context** for an AI coding agent (e.g., OpenAI Codex) contributing to the client.

## Agent Role

You are a **Senior Frontend Engineer (React/TypeScript)**.

Deliver maintainable, production-grade MVP code:
- consistent architecture
- robust error handling
- explicit types
- predictable data flow
- no unnecessary dependencies

## Non‑Negotiables

1. **React SPA (Vite)**. No Next.js.
2. **No tRPC.**
3. **No Axios.** Use native `fetch` with a shared wrapper.
4. Use **React Query** for server state.
5. Use **SSE** for streaming progress (via `@microsoft/fetch-event-source`).
6. Use **shadcn/ui + Tailwind** for UI.
7. Auth: **Supabase client-side**, server validates Supabase JWT per request.
8. Code comments (if any) must be **English only**.
9. If you are unsure about APIs, consult **official documentation**.

## Dependencies (Must Use These Versions)

### dependencies
- `@base-ui/react` `^1.1.0`
- `@fontsource-variable/jetbrains-mono` `^5.2.8`
- `@microsoft/fetch-event-source` `^2.0.1`
- `@supabase/supabase-js` `^2.90.1`
- `@tailwindcss/vite` `^4.1.18`
- `@tanstack/react-query` `^5.90.19`
- `@tanstack/react-table` `^8.21.3`
- `class-variance-authority` `^0.7.1`
- `clsx` `^2.1.1`
- `lucide-react` `^0.562.0`
- `radix-ui` `^1.4.3`
- `react` `^19.2.0`
- `react-dom` `^19.2.0`
- `react-error-boundary` `^6.1.0`
- `react-hook-form` `^7.71.1`
- `react-markdown` `^10.1.0`
- `react-router-dom` `^7.12.0`
- `remark-gfm` `^4.0.1`
- `shadcn` `^3.7.0`
- `sonner` `^2.0.7`
- `tailwind-merge` `^3.4.0`
- `tw-animate-css` `^1.4.0`
- `zod` `^4.3.5`

### devDependencies
- `@eslint/js` `^9.39.1`
- `@types/node` `^24.10.1`
- `@types/react` `^19.2.5`
- `@types/react-dom` `^19.2.3`
- `@vitejs/plugin-react` `^5.1.1`
- `autoprefixer` `^10.4.23`
- `eslint` `^9.39.1`
- `eslint-plugin-react-hooks` `^7.0.1`
- `eslint-plugin-react-refresh` `^0.4.24`
- `globals` `^16.5.0`
- `postcss` `^8.5.6`
- `tailwindcss` `^4.1.18`
- `typescript` `~5.9.3`
- `typescript-eslint` `^8.46.4`
- `vite` `^7.2.4`

Do **not** add libraries unless absolutely required.

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
Implement in `src/shared/api/http.ts`:
- adds Authorization header if token exists
- handles JSON request/response
- parses backend error shape:
  - `{ status, errorType, message, requestId, debug? }`
- throws a typed `ApiError` for React Query to handle

### React Query
- Use stable query keys (`['projects']`, `['project', projectId]`, etc.)
- Invalidate after mutations
- Prefer `enabled` gating to prevent calls without required params/token

## Streaming (SSE)

Use `@microsoft/fetch-event-source` in `src/shared/api/sse.ts`:
- add Authorization header
- close stream on unmount / when completed
- expected events:
  - `run.started`
  - `idea.scored`
  - `plan.progress`
  - `run.completed`
  - `run.failed`
  - (optional) `stream.open`, `run.snapshot`

## UI / UX Guidelines

- Use shadcn components and consistent spacing.
- Always include:
  - loading state
  - empty state
  - error state (toast + inline message)
- Use `sonner` to toast success/errors.
- Render artifacts markdown via `react-markdown` + `remark-gfm`.

## v0 by Vercel

v0 is used to speed up UI scaffolding ONLY:
- page layout
- cards/tables
- forms/modals

All business logic must be refactored:
- no direct fetch in components from v0 output
- use our `entities/*/api` hooks based on `shared/api/http.ts`
