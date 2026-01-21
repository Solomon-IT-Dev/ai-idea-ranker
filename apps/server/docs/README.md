# Server Docs (Knowledge Base)

This folder contains server-specific documentation that is meant to stay stable over time:
architecture, security, data access conventions, and operational notes.

## Index

- `apps/server/docs/DEV_GUIDE.md` — local development and day-to-day conventions
- `apps/server/docs/ARCHITECTURE.md` — module layout and boundaries (Nest-like in Express)
- `apps/server/docs/AUTH.md` — Supabase JWT verification (JWKS) and request identity
- `apps/server/docs/DATABASE.md` — Supabase Postgres + RLS (Variant B) and manual SQL schema
- `apps/server/docs/SSE.md` — run streaming (SSE) events and behavior
- `apps/server/docs/ERRORS.md` — error shape and how errors are normalized
- `apps/server/docs/SECURITY.md` — HTTP hardening (helmet/cors/rate-limit), redaction, proxy notes
- `apps/server/docs/TROUBLESHOOTING.md` — common issues and checklists
- `apps/server/docs/API.md` — API integration notes (OpenAPI/Swagger is authoritative)
- `apps/server/docs/ROADMAP.md` — follow-ups and hardening ideas
