create table if not exists public.artifacts (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.runs(id) on delete cascade,
  project_id uuid not null,
  owner_id uuid not null,
  type text not null check (type in ('plan_30_60_90', 'experiment_card')),
  content_markdown text not null,
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists artifacts_run_id_idx on public.artifacts(run_id);
create index if not exists artifacts_project_id_idx on public.artifacts(project_id);
create index if not exists artifacts_owner_id_idx on public.artifacts(owner_id);
create index if not exists artifacts_type_idx on public.artifacts(type);

alter table public.artifacts enable row level security;

create policy "artifacts_select_own"
on public.artifacts
for select
using (owner_id = auth.uid());

create policy "artifacts_insert_own"
on public.artifacts
for insert
with check (owner_id = auth.uid());
