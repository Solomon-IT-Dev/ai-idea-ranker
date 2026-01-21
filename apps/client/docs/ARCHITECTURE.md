# Client Architecture (Modular SPA)

We use a **modular architecture** suitable for a small MVP but aligned with senior-level practices.

## Goals
- Clear separation of concerns
- High cohesion inside modules
- Minimal cross-module coupling
- Easy extension for additional workflows

## Folder Layout (Approved)

```
src/
  app/
    providers/          # QueryClientProvider, ErrorBoundary, AuthProvider, Toaster
    router/             # react-router routes, protected routes, navigation setup
    layout/             # AppShell, Sidebar, Header
  pages/                # route-level composition only
    auth/
    projects/
    project/
  entities/             # domain modules (API + types + UI)
    project/
    idea/
    playbook/
    run/
    artifact/
  features/             # user workflows (forms, dialogs, wizards)
    auth/
    project/
    idea/
    playbook/
    run/
    artifact/
  shared/               # reusable infrastructure
    api/                # fetch wrapper + sse
    ui/                 # shared components/compositions
    hooks/
    lib/                # env, helpers, formatters
```

## Responsibilities

### `shared/*`
- infrastructure + generic helpers
- must not import from entities/features/pages

### `entities/*`
- domain API hooks, types, and entity UI primitives
- can import only from `shared/*`

### `features/*`
- user interactions / workflows (forms, dialogs, multi-step flows)
- can import from `shared/*` and `entities/*`

### `pages/*`
- route-level composition (wires features + entities)
- no direct networking code

### `app/*`
- application shell, routing, providers
- minimal business logic; mostly composition

## State Management

- **Server state**: React Query
- **UI state**: component state / hooks
- **Auth state**: AuthProvider + `useAuth()` hook

No Redux/Zustand planned.

## Import Order Convention (Recommended)

Within a file:
1. External deps
2. Internal absolute imports (`@/shared`, `@/entities`, `@/features`, `@/pages`, `@/app`)
3. Relative imports

If ESLint import sorting is configured, keep it consistent with this order.

## UI Component Contract

When adding or modifying shared UI wrappers (e.g. `shared/ui/input.tsx`, `shared/ui/textarea.tsx`):
- Prefer `React.forwardRef` and expose a `displayName`.
- Ensure compatibility with `react-hook-form` `register()` and `setValue()` by correctly passing `ref` and standard props to the underlying DOM element.
