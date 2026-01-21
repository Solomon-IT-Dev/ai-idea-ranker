# Database (Supabase Postgres + RLS)

The server uses Supabase Postgres with Row-Level Security (RLS). User-scoped reads/writes are
always executed with an RLS-enforced, request-scoped Supabase client.

## RLS Enforcement (Request-Scoped Client)

Implementation: `src/db/supabase.request.ts` (`createSupabaseForRequest(req)`).

How it works:
- the server extracts the user JWT from `Authorization: Bearer <token>`
- the Supabase client is created with the Anon key
- the user JWT is forwarded as a global header to Supabase so Postgres `auth.uid()` works

This is the primary mechanism that enforces “a user can only access their own rows”.

## Admin Client (Service Role)

Implementation: `src/db/supabase.server.ts`.

The Service Role client is for system tasks only (maintenance/background jobs). It bypasses RLS
and must not be used for user-scoped reads/writes.

## Schema Management (Manual SQL)

SQL schema files live in `src/db/sql/` and are applied manually in the Supabase SQL editor.

Apply once, in order:
- `src/db/sql/001_projects.sql`
- `src/db/sql/002_ideas.sql`
- `src/db/sql/003_playbooks.sql`
- `src/db/sql/004_playbook_embeddings.sql`
- `src/db/sql/005_runs.sql`
- `src/db/sql/006_artifacts.sql`

Note:
- These files contain RLS policies. Re-applying them may fail unless you drop existing policies
  first.
