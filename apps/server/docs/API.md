# Server API Notes (MVP)

This document complements the OpenAPI spec (`/openapi.json`) with a few practical
client-facing conventions.

## Auth

All protected endpoints require:

```
Authorization: Bearer <ACCESS_TOKEN>
```

## Projects

### List projects

`GET /v1/projects`

- Auth: required
- Response: `200`

```json
{ "projects": [] }
```

Notes:
- When the user has no projects, the API returns `200` with an empty array (not
  `404`).
- Ordering: newest first (`created_at DESC`).

### Create project

`POST /v1/projects`

- Auth: required
- Body:

```json
{ "name": "string", "constraints": { "budget": 0, "team": { "fe": 1, "be": 1 } } }
```

- Response: `201`

### Get project by id

`GET /v1/projects/:id`

- Auth: required
- Response: `200` (or `404 project_not_found`)

