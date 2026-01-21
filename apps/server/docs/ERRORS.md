# Errors & Responses

The server uses centralized error handling. Controllers/services throw operational `AppError`
instances; unknown errors are normalized to a safe response.

## Error Shape

Error responses are JSON with a stable shape:
```json
{ "status": "fail|error", "errorType": "string", "message": "string", "requestId": "string", "debug": {} }
```

Notes:
- `requestId` is included in every error response for log correlation.
- `debug` is only attached outside production.

## Where Errors Are Handled

- `AppError`: `src/lib/appError.lib.ts`
- Global handler: `src/middlewares/errorHandler.middleware.ts`

The handler also normalizes:
- Zod validation errors (`validation_error`)
- common PostgREST errors (e.g. RLS violations)
