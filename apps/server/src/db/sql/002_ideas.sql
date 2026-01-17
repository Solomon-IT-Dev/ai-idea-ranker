create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id uuid not null,
  title text not null,
  raw_text text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ideas_project_id_idx on public.ideas(project_id);
create index if not exists ideas_owner_id_idx on public.ideas(owner_id);

alter table public.ideas enable row level security;

-- Select own ideas only
create policy "ideas_select_own"
on public.ideas
for select
using (owner_id = auth.uid());

-- Insert own ideas only
create policy "ideas_insert_own"
on public.ideas
for insert
with check (owner_id = auth.uid());

-- Update own ideas only
create policy "ideas_update_own"
on public.ideas
for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- Delete own ideas only
create policy "ideas_delete_own"
on public.ideas
for delete
using (owner_id = auth.uid());

