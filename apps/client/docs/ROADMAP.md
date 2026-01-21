# Client Roadmap

This is a short list of follow-ups for the client. It is intentionally scoped to UX polish and small
improvements (core flows are already implemented).

## Implemented (MVP)

- SPA bootstrap (Vite + React + Tailwind + shadcn)
- Auth flow (`/auth`) with protected routes
- API layer:
  - `src/shared/api/http.ts` fetch wrapper + typed `ApiError`
  - `src/entities/*/api` hooks based on React Query
- Core screens:
  - projects list + create
  - project tabs: ideas / playbook / runs / artifacts
- Streaming UX:
  - SSE subscription for run progress and `plan.progress`
- Small persistence:
  - last opened project id
  - last selected run id for artifacts per project
