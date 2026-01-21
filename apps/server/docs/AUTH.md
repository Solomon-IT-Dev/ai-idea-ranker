# Auth (Supabase JWT)

The server authenticates requests using Supabase JWTs. The client signs in via Supabase; the
server validates the JWT on every protected request using Supabase JWKS.

## Verification

- Middleware: `src/middlewares/requireAuth.middleware.ts`
- JWKS endpoint: `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`
- On success, the middleware sets `req.userId = payload.sub`.

Expected request header:
`Authorization: Bearer <access_token>`

## Authorization vs Authentication

- Authentication (who is calling): derived from the JWT subject (`sub`) and stored in `req.userId`.
- Authorization (what they can access): enforced via:
  - Supabase RLS policies (primary enforcement)
  - explicit guards in the server when needed (e.g. project membership checks before streaming)

## Local Token For Manual Testing

For curl/Postman calls you need a Supabase user token:
- set `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` in `apps/server/.env`
- run `apps/server/scripts/getToken.script.ts` to print an access token

Use the token as:
`Authorization: Bearer <ACCESS_TOKEN>`
