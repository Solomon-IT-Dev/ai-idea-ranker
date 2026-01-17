create table if not exists public.playbooks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id uuid not null,
  title text not null,
  content_markdown text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists playbooks_project_id_idx on public.playbooks(project_id);
create index if not exists playbooks_owner_id_idx on public.playbooks(owner_id);

alter table public.playbooks enable row level security;

create policy "playbooks_select_own"
on public.playbooks
for select
using (owner_id = auth.uid());

create policy "playbooks_insert_own"
on public.playbooks
for insert
with check (owner_id = auth.uid());

create policy "playbooks_update_own"
on public.playbooks
for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "playbooks_delete_own"
on public.playbooks
for delete
using (owner_id = auth.uid());


-- Chunks
create table if not exists public.playbook_chunks (
  id uuid primary key default gen_random_uuid(),
  playbook_id uuid not null references public.playbooks(id) on delete cascade,
  project_id uuid not null,
  owner_id uuid not null,
  chunk_index int not null,
  chunk_title text,
  chunk_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists playbook_chunks_playbook_id_idx on public.playbook_chunks(playbook_id);
create index if not exists playbook_chunks_project_id_idx on public.playbook_chunks(project_id);
create index if not exists playbook_chunks_owner_id_idx on public.playbook_chunks(owner_id);

alter table public.playbook_chunks enable row level security;

create policy "playbook_chunks_select_own"
on public.playbook_chunks
for select
using (owner_id = auth.uid());

create policy "playbook_chunks_insert_own"
on public.playbook_chunks
for insert
with check (owner_id = auth.uid());

create policy "playbook_chunks_delete_own"
on public.playbook_chunks
for delete
using (owner_id = auth.uid());
