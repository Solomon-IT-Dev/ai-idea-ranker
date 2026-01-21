# State & Data (Client)

This doc explains where client state lives and how data flows through the app.

## Server State

Server state is managed with React Query:
- queries/mutations live in `src/entities/*/api/*`
- pages compose queries and features; networking stays in `entities/*` + `shared/*`

Conventions:
- use stable query keys (see key helpers like `artifactKeys`)
- invalidate queries after mutations that change server state
- gate queries with `enabled` when required inputs (e.g. `projectId`, token) are missing

## Local UI State

Local, view-only state stays in components/hooks:
- tab selection and UI toggles
- transient progress logs (SSE events)
- selected artifact versions, etc.

## Persistence

Small pieces of navigation context are stored in `localStorage`:
- last opened project id (`setLastProjectId` / `getLastProjectId`)
- last selected run id for artifacts per project (`setArtifactsLastRunId` / `getArtifactsLastRunId`)

Implementation: `src/shared/lib/storage.ts`.

## Forms & Validation

Forms use:
- `react-hook-form` for state management
- `zod` schemas for validation

The resolver is centralized in `src/shared/lib/zodResolver`.
