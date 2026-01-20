# Client Roadmap

This plan matches the backend milestones already implemented.

## Milestone A — Bootstrap

- Vite React TS
- Tailwind v4 via `@tailwindcss/vite`
- shadcn setup
- base providers:
  - React Query
  - ErrorBoundary
  - Toaster (sonner)
- Router skeleton

## Milestone B — Auth

Screens:
- `/auth` sign-in / sign-up
- protected routes require session

Implementation:
- `AuthProvider` (Supabase session)
- `useAuth()` (token + user)
- `ProtectedRoute` wrapper

## Milestone C — API Layer

- `shared/api/http.ts` wrapper + typed errors
- `shared/api/sse.ts` wrapper
- `entities/*/api` hooks using React Query

## Milestone D — Screens & Core Flow

### Screens
1. **Auth** (`/auth`)
2. **Projects List** (`/projects`)
   - list + create project
3. **Project Detail** (`/projects/:projectId`)
   - Tabs:
     - Ideas (import/edit/delete)
     - Playbook (upload)
     - Runs (execute + history)
     - Artifacts (generate + versions)

### UI Expectations
- Loading skeletons for lists
- Empty states with CTA
- Error states with toast + retry

## Milestone E — Streaming UX (SSE)

- Subscribe to run stream while executing a run
- Show progress feed + per-idea scored updates
- Subscribe to artifact generation progress (`plan.progress`)
- On completion, re-fetch run/artifacts via REST

## Milestone F — Polish (If Time Allows)

- Use `@tanstack/react-table` for score tables/version history
- Better markdown rendering UX (copy/export)
- Persist last opened project id
- Simple “debug” section (requestId) for failed calls
