# Errors & Troubleshooting Signals

The client relies on a consistent error shape from the server and a small set of UI conventions to
keep failures easy to understand and easy to debug.

## Server Error Shape

The server returns JSON errors like:
```json
{ "status": "fail|error", "errorType": "string", "message": "string", "requestId": "string", "debug": {} }
```

Notes:
- `requestId` is important for correlating a user report with server logs.
- `debug` is only present outside production.

## REST Wrapper Error Type

`src/shared/api/http.ts` throws `ApiError` for non-2xx responses.

Available fields:
- `status` (HTTP status code)
- `message`
- `errorType` (server-defined)
- `requestId`
- `debug` (non-production)

## UI Patterns

- Queries: use `useToastQueryError(...)` for “global” toast errors; use `ErrorState` for views that
  can render an inline retry action.
- Mutations: show toasts on success/failure and keep forms disabled while pending.

## What To Capture When Reporting a Bug

- the user-visible message
- the `requestId` (if present)
- the failing request path + status from the browser Network tab
