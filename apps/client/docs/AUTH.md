# Client Auth

The client uses Supabase Auth in the browser. Authentication state is sourced from the Supabase
session and exposed to the app via a small context provider.

## Auth State

- Provider: `src/features/auth/model/auth.provider.tsx` (`AuthProvider`)
- Hook: `src/features/auth/model/auth.hooks.ts` (`useAuth()`)

Exposed values:
- `isReady`: session check finished (initial load + first auth state event)
- `user`: current Supabase user (or `null`)
- `accessToken`: current session token (or `null`)
- `signOut()`: signs out via Supabase

## Token Propagation

For REST calls, the access token is injected into the shared fetch wrapper:
- token source: `AuthProvider` sets a token provider via `src/shared/api/token.ts`
- REST wrapper: `src/shared/api/http.ts` adds `Authorization: Bearer <token>` when available

For SSE calls, the stream hook fetches a fresh token from Supabase before opening the connection:
- `src/features/runStream/model/runStream.hooks.ts`

## Routing Behavior

- Protected routes are wrapped by `ProtectedRoute` (`src/app/router/protectedRoute.tsx`).
- When unauthenticated, the user is redirected to `/auth` and the original path is passed as
  `state.from` (used for post-login redirect).
- `/` is a smart redirect (`src/app/router/rootRedirect.tsx`) that sends authenticated users to the
  last opened project if present.

## Sign In / Sign Up

`/auth` uses:
- sign in: `supabase.auth.signInWithPassword`
- sign up: `supabase.auth.signUp`

After successful auth, navigation is handled by the auth state effect (redirects to `state.from`,
last project, or `/projects`).
