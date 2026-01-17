create extension if not exists vector;

alter table public.playbook_chunks
add column if not exists embedding vector(1536);

create policy "playbook_chunks_update_own"
on public.playbook_chunks
for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create index if not exists playbook_chunks_embedding_hnsw
on public.playbook_chunks
using hnsw (embedding vector_cosine_ops);

create or replace function public.match_playbook_chunks(
  p_project_id uuid,
  p_query_embedding vector(1536),
  p_match_count int
)
returns table (
  id uuid,
  chunk_index int,
  chunk_title text,
  chunk_text text,
  similarity float
)
language sql
stable
as $$
  select
    c.id,
    c.chunk_index,
    c.chunk_title,
    c.chunk_text,
    1 - (c.embedding <=> p_query_embedding) as similarity
  from public.playbook_chunks c
  where c.project_id = p_project_id
    and c.embedding is not null
  order by c.embedding <=> p_query_embedding
  limit p_match_count;
$$;
