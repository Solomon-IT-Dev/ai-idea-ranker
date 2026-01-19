import { openapiSpec } from './openapi.spec.js'

import type { Controller } from '../../types/controller.types.js'

export const getOpenApiJsonController: Controller = async (_req, res) => {
  res.status(200).json(openapiSpec)
}

export const getSwaggerUiController: Controller = async (_req, res) => {
  // Swagger UI loads JS/CSS from a CDN; override Helmet's default CSP for this page only.
  res.setHeader(
    'content-security-policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "img-src 'self' data:",
      "font-src 'self' https: data:",
      "style-src 'self' https: 'unsafe-inline'",
      "script-src 'self' https: 'unsafe-inline'",
      "connect-src 'self'",
      'upgrade-insecure-requests',
    ].join('; ')
  )

  res.status(200).type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AI Idea Ranker — API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        persistAuthorization: true
      })
    </script>
  </body>
</html>`)
}
