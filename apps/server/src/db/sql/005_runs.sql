create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  owner_id uuid not null,
  status text not null default 'completed', -- MVP: completed/failed later
  model text not null,
  weights jsonb not null default '{}'::jsonb,
  top_n int not null default 5,
  created_at timestamptz not null default now()
);

create index if not exists runs_project_id_idx on public.runs(project_id);
create index if not exists runs_owner_id_idx on public.runs(owner_id);

alter table public.runs enable row level security;

create policy "runs_select_own"
on public.runs
for select
using (owner_id = auth.uid());

create policy "runs_insert_own"
on public.runs
for insert
with check (owner_id = auth.uid());


create table if not exists public.idea_scores (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.runs(id) on delete cascade,
  project_id uuid not null,
  owner_id uuid not null,
  idea_id uuid not null references public.ideas(id) on delete cascade,
  impact int not null,
  effort int not null,
  risk int not null,
  data_readiness int not null,
  overall float not null,
  rationale text not null,
  citations jsonb not null default '[]'::jsonb,
  cost_estimate_usd int,
  resource_estimate jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idea_scores_run_id_idx on public.idea_scores(run_id);
create index if not exists idea_scores_project_id_idx on public.idea_scores(project_id);
create index if not exists idea_scores_owner_id_idx on public.idea_scores(owner_id);
create index if not exists idea_scores_idea_id_idx on public.idea_scores(idea_id);

alter table public.idea_scores enable row level security;

create policy "idea_scores_select_own"
on public.idea_scores
for select
using (owner_id = auth.uid());

create policy "idea_scores_insert_own"
on public.idea_scores
for insert
with check (owner_id = auth.uid());

alter table public.runs
  add column if not exists prompt_version text not null default 'v1',
  add column if not exists input_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists sources_used jsonb not null default '[]'::jsonb,
  add column if not exists raw_ai_response jsonb,
  add column if not exists error_type text,
  add column if not exists error_message text;

-- allow updating own runs (for status transitions)
create policy "runs_update_own"
on public.runs
for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());
