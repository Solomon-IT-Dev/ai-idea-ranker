# Client Routing

Routes are defined in `src/app/router/routes.tsx` using `createBrowserRouter`.

## Route Map

Public:
- `/` → `RootRedirect` (smart redirect based on auth + last project)
- `/auth` → auth page (sign in / sign up)

Authenticated (wrapped by `ProtectedRoute`):
- `/projects` → projects list
- `/projects/:projectId` → project layout with tabs
  - `/projects/:projectId/ideas`
  - `/projects/:projectId/playbook`
  - `/projects/:projectId/runs`
  - `/projects/:projectId/artifacts`
- `/projects/:projectId/runs/:runId` → run details page

## Default Tab

`/projects/:projectId` redirects to `ideas`.

## Query Parameters (Deep Links)

These are UI-level conventions used for navigation and highlighting.

- Playbook chunk highlight:
  - `/projects/:projectId/playbook?chunkId=<uuid>`
  - The tab scrolls to the chunk and highlights it.

- Artifacts run selection:
  - `/projects/:projectId/artifacts?runId=<uuid>`
  - The tab loads latest + historical artifacts for that run.

## Navigation Persistence

The app stores a few navigation helpers in `localStorage` (via `src/shared/lib/storage.ts`):
- last opened project id (used by `/` redirect)
- last selected run id for artifacts per project (used by the Artifacts tab)
