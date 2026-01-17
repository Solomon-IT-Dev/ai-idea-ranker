create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  constraints jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Owner can read own projects
create policy "projects_select_own"
on public.projects
for select
using (owner_id = auth.uid());

-- Owner can insert own projects
create policy "projects_insert_own"
on public.projects
for insert
with check (owner_id = auth.uid());
