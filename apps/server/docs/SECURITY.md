# Security & Hardening

The server applies a small set of baseline protections suitable for an API behind a reverse proxy.

## HTTP Middleware

Configured in `src/app.ts`:
- `helmet` — security headers tuned for API + cross-origin frontend
- `cors` — permissive in dev; restricted to `CLIENT_ORIGIN` in production (if set)
- `hpp` — prevents HTTP parameter pollution
- `compression` — enabled for responses, but disabled for SSE streams
- `express-rate-limit` — applied to `/v1` routes (health is excluded)

## Proxy / Hosting Notes

The app sets `trust proxy` (see `securityConstants.trustProxy`) to behave correctly behind
platform proxies (Railway/Vercel/etc).

## Secrets & Logging

- Authorization headers are redacted from HTTP logs (`src/lib/logger.lib.ts`).
- Do not log secrets from env or third-party responses.
