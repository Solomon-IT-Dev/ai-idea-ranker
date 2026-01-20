# AI Idea Ranker — Client (React SPA)

This directory contains the **frontend** for the AI Idea Ranker test assignment.

The client is a **React SPA (no Next.js)** built with **Vite** and TypeScript.  
It communicates with the Express API using:

- **REST (JSON)** for standard operations (CRUD, run creation, artifact generation).
- **SSE (Server-Sent Events)** for streaming progress during long AI operations.

Authentication is performed via **Supabase Auth** on the client. The server validates the Supabase JWT for every request via:

`Authorization: Bearer <access_token>`

## Stack (Approved)

### Core
- React `19.2.0`
- TypeScript `~5.9.3`
- Vite `^7.2.4`
- React Router DOM `^7.12.0`

### UI
- Tailwind CSS `^4.1.18` via `@tailwindcss/vite`
- shadcn/ui (CLI `^3.7.0`) + Radix primitives
- `lucide-react` icons
- `sonner` for toasts
- `react-markdown` + `remark-gfm` for rendering artifacts

### Data / Networking
- **Native `fetch`** + a small shared wrapper (**no Axios**)
- `@tanstack/react-query` for server state
- `@microsoft/fetch-event-source` for SSE with Authorization headers
- `zod` + `react-hook-form` for form validation
- (Optional) `@tanstack/react-table` for score tables and version lists

### Reliability
- `react-error-boundary` for top-level error boundaries

### Design/Scaffolding Tooling
- **v0 by Vercel** is used to scaffold UI quickly (layout/cards/tables/forms).
  - Use it ONLY for UI scaffolding.
  - Replace any inline networking with our `shared/api` layer + React Query.

## Installed Dependencies (Pinned by package.json)

See `docs/DEV_GUIDE.md` for the exact dependency list and rules.

## Environment Variables

Create `apps/client/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Notes:
- Supabase **anon** key is safe to expose in client apps (it is not a secret).
- Never commit `.env` files.

## Development

From repo root:

```bash
pnpm -C apps/client dev
```

## Key Product Flow (User Perspective)

1. User signs in/up (Supabase).
2. User creates a Project (name + constraints: budget and team).
3. User imports Ideas (text/markdown).
4. User uploads a Playbook (text/markdown) which is chunked & embedded on the server.
5. User runs “Score & Rank” (Run) with weights/topN; server streams scoring progress.
6. User generates Artifacts (30-60-90 plan + Experiment Card); server streams progress.
7. User reviews artifacts (all versions) rendered as markdown with citations.

## Conventions (Non‑negotiables)

- TypeScript everywhere.
- **No Axios, no tRPC.**
- React Query owns server state.
- SSE used for progress UX; always close streams on unmount.
- Keep code modular: `shared` → `entities` → `features` → `pages`.
- Comments must be **English only**.
