# Backend Roadmap (MVP-first, Senior-level demo)

This roadmap describes the remaining backend work after:
- server bootstrap (Express + TypeScript + ESM)
- requestId + centralized error handling (`AppError`)
- Supabase Auth via JWKS (`jose`)
- Supabase DB **Variant B** (request-scoped client; RLS enforced)
- Projects module implemented and validated with multi-user RLS checks

Product constraints:
- **Text/markdown only** for inputs and outputs
- Single-user MVP is acceptable, but Supabase Auth enables multi-user quickly
- Tests are postponed until the end (if time remains)

AI decisions:
- AI provider: **OpenAI**
- Planned orchestration: **Vercel AI SDK + a minimal LangChain module** (only where it adds real value)

---

## Milestone 1 — Ideas Import & Storage (no AI yet)

Status: ✅ Completed

Goal: upload/enter a list of PoC ideas (markdown/text), parse, and persist.

- DB
  - `ideas` table:
    - `id uuid`
    - `project_id uuid`
    - `owner_id uuid`
    - `title text`
    - `raw_text text`
    - `meta jsonb` (optional)
    - `created_at timestamptz`
  - RLS must enforce ownership (`owner_id = auth.uid()`), or enforce via project ownership.

- API
  - `POST /v1/projects/:projectId/ideas:import`
    - input: `{ text: string }`
    - output: `{ insertedCount, ideas, truncated }`
  - `GET /v1/projects/:projectId/ideas?limit=50&offset=0`
  - Optional for UX:
    - `PATCH /v1/ideas/:id` (edit and rerun)
    - `DELETE /v1/ideas/:id`

- Implementation notes
  - parsing belongs in service layer
  - validators: Zod
  - keep routes thin (controller wrapper pattern)

---

## Milestone 2 — Playbook ingestion + citations (RAG foundation)

Status: ✅ Completed

Goal: ingest a short playbook and enable cited best-practice tips.

- DB
  - `playbooks` (per project)
  - `playbook_chunks`:
    - deterministic chunking (headers/paragraphs)
    - `chunk_text text`, `chunk_index int`, `source_label text`

- API
  - `POST /v1/projects/:projectId/playbook`
    - `{ title?: string, content: string }`
  - `GET /v1/projects/:projectId/playbook`
  - Optional:
    - `POST /v1/projects/:projectId/playbook:search` (semantic search)

- Notes
  - first iteration may store chunks without embeddings
  - later add embeddings + retrieval (pgvector)
  - AI outputs must cite retrieved chunks (store citations with chunk ids + excerpts)

---

## Milestone 3 — Embeddings + retrieval (pgvector)

Status: ✅ Completed

Goal: enable semantic retrieval for playbook citations.

- DB
  - enable `pgvector` extension
  - add `embedding vector(...)` column to `playbook_chunks`

- Pipeline
  - embeddings via OpenAI
  - retrieval: top-k chunks by cosine similarity for a query

---

## Milestone 4 — AI scoring & ranking

Goal: score and rank ideas using OpenAI; keep aggregation deterministic server-side.

- DB
  - `runs`:
    - project_id, owner_id, status
    - `params jsonb` (weights, constraints)
    - `model`, `prompt_version` for reproducibility
  - `idea_scores`:
    - run_id, idea_id
    - subscores: impact/effort/risk/data readiness
    - `overall` computed server-side
    - rationale markdown
    - citations jsonb

- API
  - `POST /v1/projects/:projectId/runs` (create and execute run)
  - `GET /v1/projects/:projectId/runs/:runId` (results)

- AI requirements
  - structured outputs validated by Zod
  - citations included (from playbook retrieval)
  - rough resource/cost estimates per top ideas

---

## Milestone 5 — 30-60-90 plan + Experiment Card

Goal: generate actionable artifacts for top picks.

- Artifacts
  - 30/60/90 plan (markdown)
  - Experiment Card (problem, hypothesis, dataset, metrics, go/no-go)

- DB
  - `artifacts`:
    - run_id, type, content_markdown, citations

- API
  - either generated as part of `POST /runs`, or
  - `POST /v1/runs/:runId/artifacts:generate`

---

## Milestone 6 — Streaming (SSE)

Goal: improve UX by streaming progress during AI generation.

- API
  - `GET /v1/runs/:runId/stream` (SSE)

- Events
  - `run.started`, `idea.scored`, `plan.progress`, `run.completed`, `run.failed`

- Persistence
  - store partial checkpoints or at minimum save final results for refresh

---

## Milestone 7 — Hardening / DX (if time remains)

- redact authorization token from logs (mandatory for any public deployment)
- OpenAI resiliency: timeouts, retries (429), safe fallbacks
- caching: hash inputs to reuse previous scoring/plan outputs
- minimal DevDocs endpoint contracts (or OpenAPI/Swagger)
- minimal unit tests for pure logic
