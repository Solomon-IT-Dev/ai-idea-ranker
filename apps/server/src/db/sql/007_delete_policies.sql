-- Required for `DELETE projects` to cascade into runs/artifacts/scores under RLS.

-- projects
drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
on public.projects
for delete
using (owner_id = auth.uid());

-- runs
drop policy if exists "runs_delete_own" on public.runs;
create policy "runs_delete_own"
on public.runs
for delete
using (owner_id = auth.uid());

-- artifacts
drop policy if exists "artifacts_delete_own" on public.artifacts;
create policy "artifacts_delete_own"
on public.artifacts
for delete
using (owner_id = auth.uid());

-- idea_scores
drop policy if exists "idea_scores_delete_own" on public.idea_scores;
create policy "idea_scores_delete_own"
on public.idea_scores
for delete
using (owner_id = auth.uid());
