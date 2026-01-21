export const openapiSpec = {
  openapi: '3.1.0',
  info: {
    version: '1.0.0',
    title: 'AI Idea Ranker API',
    description: [
      'OpenAPI documentation for the AI Idea Ranker server.',
      '',
      'Notes:',
      '- Auth: use `Authorization: Bearer <Supabase access token>` on protected endpoints.',
      '- Request correlation: the server returns `x-request-id` on every response; error bodies also include `requestId`.',
      '- Errors: JSON error shape is stable (`status`, `errorType`, `message`, `requestId`, optional `debug`).',
      '- Streaming: long-running operations stream progress via SSE (`text/event-stream`).',
    ].join('\n'),
  },
  servers: [
    {
      url: 'https://appsserver-production-d740.up.railway.app',
      description: 'Production server (Railway)',
    },
    {
      url: 'http://localhost:8080',
      description: 'Local server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Healthcheck endpoint.' },
    { name: 'Auth', description: 'Authentication endpoints.' },
    { name: 'Projects', description: 'Project management.' },
    { name: 'Ideas', description: 'Ideas import and management.' },
    { name: 'Playbook', description: 'Playbook ingestion and search.' },
    { name: 'Runs', description: 'AI scoring runs.' },
    { name: 'Artifacts', description: '30/60/90 plan and Experiment Card.' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    headers: {
      XRequestId: {
        description:
          'Correlation id for this request (also included in error bodies as `requestId`).',
        schema: { type: 'string', format: 'uuid' },
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad Request',
        headers: { 'x-request-id': { $ref: '#/components/headers/XRequestId' } },
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            examples: {
              validation: {
                summary: 'Validation error',
                value: {
                  status: 'fail',
                  errorType: 'validation_error',
                  message: 'input: Invalid input',
                  requestId: '00000000-0000-0000-0000-000000000000',
                },
              },
            },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized',
        headers: { 'x-request-id': { $ref: '#/components/headers/XRequestId' } },
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            examples: {
              missingToken: {
                summary: 'Missing token',
                value: {
                  status: 'fail',
                  errorType: 'auth_missing_token',
                  message: 'Authorization token is missing.',
                  requestId: '00000000-0000-0000-0000-000000000000',
                },
              },
            },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden',
        headers: { 'x-request-id': { $ref: '#/components/headers/XRequestId' } },
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      NotFound: {
        description: 'Not Found',
        headers: { 'x-request-id': { $ref: '#/components/headers/XRequestId' } },
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      Conflict: {
        description: 'Conflict',
        headers: { 'x-request-id': { $ref: '#/components/headers/XRequestId' } },
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      TooManyRequests: {
        description: 'Too Many Requests',
        headers: { 'x-request-id': { $ref: '#/components/headers/XRequestId' } },
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            examples: {
              rateLimit: {
                summary: 'Rate limited',
                value: {
                  status: 'fail',
                  errorType: 'too_many_requests',
                  message: 'Too many requests from this IP, please try again later.',
                  requestId: '00000000-0000-0000-0000-000000000000',
                },
              },
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal Server Error',
        headers: { 'x-request-id': { $ref: '#/components/headers/XRequestId' } },
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      BadGateway: {
        description: 'Bad Gateway',
        headers: { 'x-request-id': { $ref: '#/components/headers/XRequestId' } },
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      ServiceUnavailable: {
        description: 'Service Unavailable',
        headers: { 'x-request-id': { $ref: '#/components/headers/XRequestId' } },
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['fail', 'error'] },
          errorType: { type: 'string' },
          message: { type: 'string' },
          requestId: { type: 'string' },
          debug: { type: 'object', additionalProperties: true },
        },
        required: ['status', 'errorType', 'message', 'requestId'],
      },
      AuthMeResponse: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' },
          requestId: { type: 'string', format: 'uuid' },
        },
        required: ['userId', 'requestId'],
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          owner_id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          constraints: { type: 'object', additionalProperties: true },
          created_at: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'owner_id', 'name', 'constraints', 'created_at'],
      },
      RunStatus: {
        type: 'string',
        enum: ['running', 'completed', 'failed'],
      },
      Citation: {
        type: 'object',
        properties: {
          chunkId: { type: 'string', format: 'uuid' },
          quote: { type: 'string' },
        },
        required: ['chunkId', 'quote'],
      },
      RunWeights: {
        type: 'object',
        properties: {
          impact: { type: 'number' },
          effort: { type: 'number' },
          risk: { type: 'number' },
          dataReadiness: { type: 'number' },
        },
        required: ['impact', 'effort', 'risk', 'dataReadiness'],
      },
      ResourceEstimate: {
        type: 'object',
        properties: {
          feDays: { type: 'number' },
          beDays: { type: 'number' },
          dsDays: { type: 'number' },
        },
        additionalProperties: true,
      },
      Idea: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          project_id: { type: 'string', format: 'uuid' },
          owner_id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          raw_text: { type: 'string' },
          meta: { type: 'object', additionalProperties: true },
          created_at: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'project_id', 'owner_id', 'title', 'raw_text', 'meta', 'created_at'],
      },
      Playbook: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          project_id: { type: 'string', format: 'uuid' },
          owner_id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          content_markdown: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
        required: [
          'id',
          'project_id',
          'owner_id',
          'title',
          'content_markdown',
          'created_at',
          'updated_at',
        ],
      },
      PlaybookChunk: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          playbook_id: { type: 'string', format: 'uuid' },
          project_id: { type: 'string', format: 'uuid' },
          owner_id: { type: 'string', format: 'uuid' },
          chunk_index: { type: 'integer' },
          chunk_title: { type: ['string', 'null'] },
          chunk_text: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
        required: [
          'id',
          'playbook_id',
          'project_id',
          'owner_id',
          'chunk_index',
          'chunk_title',
          'chunk_text',
          'created_at',
        ],
      },
      Run: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          project_id: { type: 'string', format: 'uuid' },
          owner_id: { type: 'string', format: 'uuid' },
          status: { $ref: '#/components/schemas/RunStatus' },
          model: { type: 'string' },
          weights: { $ref: '#/components/schemas/RunWeights' },
          top_n: { type: 'integer' },
          prompt_version: { type: 'string' },
          input_snapshot: { type: 'object', additionalProperties: true },
          sources_used: { type: 'array', items: { type: 'object', additionalProperties: true } },
          raw_ai_response: { type: ['object', 'null'], additionalProperties: true },
          error_type: { type: ['string', 'null'] },
          error_message: { type: ['string', 'null'] },
          created_at: { type: 'string', format: 'date-time' },
        },
        required: [
          'id',
          'project_id',
          'owner_id',
          'status',
          'model',
          'weights',
          'top_n',
          'prompt_version',
          'input_snapshot',
          'sources_used',
          'created_at',
        ],
      },
      IdeaScore: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          run_id: { type: 'string', format: 'uuid' },
          project_id: { type: 'string', format: 'uuid' },
          owner_id: { type: 'string', format: 'uuid' },
          idea_id: { type: 'string', format: 'uuid' },
          impact: { type: 'integer' },
          effort: { type: 'integer' },
          risk: { type: 'integer' },
          data_readiness: { type: 'integer' },
          overall: { type: 'number' },
          rationale: { type: 'string' },
          citations: { type: 'array', items: { $ref: '#/components/schemas/Citation' } },
          cost_estimate_usd: { type: ['integer', 'null'] },
          resource_estimate: { $ref: '#/components/schemas/ResourceEstimate' },
          ideas: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
            },
            required: ['id', 'title'],
          },
          created_at: { type: 'string', format: 'date-time' },
        },
        required: [
          'id',
          'run_id',
          'project_id',
          'owner_id',
          'idea_id',
          'impact',
          'effort',
          'risk',
          'data_readiness',
          'overall',
          'rationale',
          'citations',
          'resource_estimate',
          'created_at',
        ],
      },
      Artifact: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          run_id: { type: 'string', format: 'uuid' },
          project_id: { type: 'string', format: 'uuid' },
          owner_id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['plan_30_60_90', 'experiment_card'] },
          content_markdown: { type: 'string' },
          citations: { type: 'array', items: { $ref: '#/components/schemas/Citation' } },
          created_at: { type: 'string', format: 'date-time' },
        },
        required: [
          'id',
          'run_id',
          'project_id',
          'owner_id',
          'type',
          'content_markdown',
          'citations',
          'created_at',
        ],
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Healthcheck',
        responses: {
          '200': {
            description: 'OK',
            headers: { 'x-request-id': { $ref: '#/components/headers/XRequestId' } },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { ok: { type: 'boolean' } },
                  required: ['ok'],
                },
              },
            },
          },
        },
      },
    },
    '/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthMeResponse' } },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/v1/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    projects: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Project' },
                      default: [],
                    },
                  },
                  required: ['projects'],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create project',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1, maxLength: 120 },
                  constraints: { type: 'object', additionalProperties: true, default: {} },
                },
                required: ['name'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { project: { $ref: '#/components/schemas/Project' } },
                  required: ['project'],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/v1/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project by id',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { project: { $ref: '#/components/schemas/Project' } },
                  required: ['project'],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
      delete: {
        tags: ['Projects'],
        summary: 'Delete project by id (cascades)',
        description:
          'Deletes the project and all related data (ideas, runs, playbooks, chunks, artifacts, scores) via DB cascades.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '204': { description: 'No Content' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/v1/projects/{projectId}/ideas:import': {
      post: {
        tags: ['Ideas'],
        summary: 'Import ideas from text/markdown',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { text: { type: 'string', minLength: 1, maxLength: 50000 } },
                required: ['text'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    insertedCount: { type: 'integer' },
                    ideas: { type: 'array', items: { $ref: '#/components/schemas/Idea' } },
                    truncated: { type: 'boolean' },
                  },
                  required: ['insertedCount', 'ideas', 'truncated'],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/v1/projects/{projectId}/ideas': {
      get: {
        tags: ['Ideas'],
        summary: 'List ideas in a project',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 50, maximum: 200 },
          },
          {
            name: 'offset',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 0, minimum: 0 },
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ideas: { type: 'array', items: { $ref: '#/components/schemas/Idea' } },
                    limit: { type: 'integer' },
                    offset: { type: 'integer' },
                  },
                  required: ['ideas', 'limit', 'offset'],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/v1/ideas/{id}': {
      patch: {
        tags: ['Ideas'],
        summary: 'Update idea',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', minLength: 1, maxLength: 200 },
                  rawText: { type: 'string', minLength: 1, maxLength: 50000 },
                  meta: { type: 'object', additionalProperties: true },
                },
                minProperties: 1,
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { idea: { $ref: '#/components/schemas/Idea' } },
                  required: ['idea'],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
      delete: {
        tags: ['Ideas'],
        summary: 'Delete idea',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '204': { description: 'No Content' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/v1/projects/{projectId}/playbook': {
      post: {
        tags: ['Playbook'],
        summary: 'Upsert playbook',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', minLength: 1, maxLength: 120 },
                  content: { type: 'string', minLength: 1, maxLength: 300000 },
                },
                required: ['title', 'content'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    playbook: { $ref: '#/components/schemas/Playbook' },
                    chunksInserted: { type: 'integer' },
                    embeddings: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', enum: ['ok', 'failed'] },
                        errorType: { type: ['string', 'null'] },
                      },
                      required: ['status'],
                    },
                  },
                  required: ['playbook', 'chunksInserted', 'embeddings'],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
      get: {
        tags: ['Playbook'],
        summary: 'Get playbook',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    playbook: {
                      anyOf: [{ $ref: '#/components/schemas/Playbook' }, { type: 'null' }],
                    },
                    chunks: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/PlaybookChunk' },
                    },
                  },
                  required: ['playbook', 'chunks'],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/v1/projects/{projectId}/playbook:search': {
      post: {
        tags: ['Playbook'],
        summary: 'Semantic search in playbook chunks',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  query: { type: 'string', minLength: 1, maxLength: 5000 },
                  topK: { type: 'integer', default: 5, minimum: 1, maximum: 20 },
                  includeText: { type: 'boolean', default: true },
                },
                required: ['query'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string' },
                    topK: { type: 'integer' },
                    results: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          chunkId: { type: 'string', format: 'uuid' },
                          chunkIndex: { type: 'integer' },
                          title: { type: ['string', 'null'] },
                          score: { type: 'number' },
                          text: { type: ['string', 'null'] },
                        },
                        required: ['chunkId', 'chunkIndex', 'title', 'score'],
                      },
                    },
                  },
                  required: ['query', 'topK', 'results'],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '409': { $ref: '#/components/responses/Conflict' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '502': { $ref: '#/components/responses/BadGateway' },
          '503': { $ref: '#/components/responses/ServiceUnavailable' },
        },
      },
    },
    '/v1/projects/{projectId}/runs': {
      get: {
        tags: ['Runs'],
        summary: 'List runs for a project',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    runs: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Run' },
                      default: [],
                    },
                  },
                  required: ['runs'],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
      post: {
        tags: ['Runs'],
        summary: 'Create scoring run (sync)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  topN: { type: 'integer', default: 5, minimum: 1, maximum: 20 },
                  weights: {
                    type: 'object',
                    properties: {
                      impact: { type: 'number', default: 1, minimum: 0, maximum: 5 },
                      effort: { type: 'number', default: 1, minimum: 0, maximum: 5 },
                      risk: { type: 'number', default: 1, minimum: 0, maximum: 5 },
                      dataReadiness: { type: 'number', default: 1, minimum: 0, maximum: 5 },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    run: { $ref: '#/components/schemas/Run' },
                    top: { type: 'array', items: { $ref: '#/components/schemas/IdeaScore' } },
                  },
                  required: ['run', 'top'],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '409': { $ref: '#/components/responses/Conflict' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '502': { $ref: '#/components/responses/BadGateway' },
          '503': { $ref: '#/components/responses/ServiceUnavailable' },
        },
      },
    },
    '/v1/projects/{projectId}/runs:execute': {
      post: {
        tags: ['Runs'],
        summary: 'Create scoring run (async)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: { $ref: '#/paths/~1v1~1projects~1{projectId}~1runs/post/requestBody' },
        responses: {
          '202': {
            description: 'Accepted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { run: { $ref: '#/components/schemas/Run' } },
                  required: ['run'],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '409': { $ref: '#/components/responses/Conflict' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/v1/projects/{projectId}/runs/{runId}': {
      get: {
        tags: ['Runs'],
        summary: 'Get run with scores',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          { name: 'runId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    run: { $ref: '#/components/schemas/Run' },
                    scores: { type: 'array', items: { $ref: '#/components/schemas/IdeaScore' } },
                  },
                  required: ['run', 'scores'],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/v1/projects/{projectId}/runs/{runId}/stream': {
      get: {
        tags: ['Runs'],
        summary: 'SSE stream for run progress',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          { name: 'runId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'text/event-stream',
            content: {
              'text/event-stream': {
                schema: { type: 'string' },
                examples: {
                  event: {
                    summary: 'Example SSE event',
                    value: 'event: run.started\ndata: {"runId":"<uuid>","projectId":"<uuid>"}\n\n',
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/v1/projects/{projectId}/runs/{runId}/artifacts:generate': {
      post: {
        tags: ['Artifacts'],
        summary: 'Generate artifacts for a run',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          { name: 'runId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { topN: { type: 'integer', default: 3, minimum: 1, maximum: 10 } },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    runId: { type: 'string', format: 'uuid' },
                    model: { type: 'string' },
                    artifacts: {
                      type: 'object',
                      properties: {
                        plan: { $ref: '#/components/schemas/Artifact' },
                        experimentCard: { $ref: '#/components/schemas/Artifact' },
                      },
                      required: ['plan', 'experimentCard'],
                    },
                  },
                  required: ['runId', 'model', 'artifacts'],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '409': { $ref: '#/components/responses/Conflict' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '502': { $ref: '#/components/responses/BadGateway' },
          '503': { $ref: '#/components/responses/ServiceUnavailable' },
        },
      },
    },
    '/v1/projects/{projectId}/runs/{runId}/artifacts:latest': {
      get: {
        tags: ['Artifacts'],
        summary: 'Get latest artifacts for a run',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          { name: 'runId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    runId: { type: 'string', format: 'uuid' },
                    artifacts: {
                      type: 'object',
                      properties: {
                        plan: {
                          anyOf: [{ $ref: '#/components/schemas/Artifact' }, { type: 'null' }],
                        },
                        experimentCard: {
                          anyOf: [{ $ref: '#/components/schemas/Artifact' }, { type: 'null' }],
                        },
                      },
                      required: ['plan', 'experimentCard'],
                    },
                  },
                  required: ['runId', 'artifacts'],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/v1/projects/{projectId}/runs/{runId}/artifacts': {
      get: {
        tags: ['Artifacts'],
        summary: 'List artifacts for a run',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          { name: 'runId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    runId: { type: 'string', format: 'uuid' },
                    artifacts: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Artifact' },
                    },
                    byType: {
                      type: 'object',
                      properties: {
                        plan_30_60_90: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Artifact' },
                        },
                        experiment_card: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Artifact' },
                        },
                      },
                      required: ['plan_30_60_90', 'experiment_card'],
                    },
                  },
                  required: ['runId', 'artifacts', 'byType'],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
  },
} as const
