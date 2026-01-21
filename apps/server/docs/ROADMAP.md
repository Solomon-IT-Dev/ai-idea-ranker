# Backend Roadmap / Backlog

This document tracks high-level backend follow-ups. The API surface itself is documented via
OpenAPI/Swagger (`/openapi.json`, `/docs`).

## Implemented (MVP)

- Express + TypeScript (ESM)
- centralized errors with request correlation (`x-request-id`)
- Supabase JWT auth (JWKS) with `req.userId`
- Supabase Postgres with RLS enforced via request-scoped clients
- project/idea/playbook/run/artifact modules with persistence
- embeddings + retrieval for playbook citations
- SSE streaming for long-running operations (runs + artifact generation)
