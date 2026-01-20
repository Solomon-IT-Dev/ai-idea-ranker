export const openapiSpec = {
  openapi: '3.1.0',
  info: {
    version: '1.0.0',
    title: 'AI Idea Ranker API',
    description: 'OpenAPI documentation for the AI Idea Ranker server.',
  },
  servers: [
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
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['fail', 'error'] },
          errorType: { type: 'string' },
          message: { type: 'string' },
          requestId: { type: 'string' },
        },
        required: ['status', 'errorType', 'message'],
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
        required: [
          'id',
          'project_id',
          'owner_id',
          'title',
          'raw_text',
          'meta',
          'created_at',
        ],
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
          status: { type: 'string' },
          model: { type: 'string' },
          weights: { type: 'object', additionalProperties: true },
          top_n: { type: 'integer' },
          prompt_version: { type: 'string' },
          input_snapshot: { type: 'object', additionalProperties: true },
          sources_used: { type: 'array', items: { type: 'object', additionalProperties: true } },
          raw_ai_response: { type: ['object', 'null'], additionalProperties: true },
          error_type: { type: ['string', 'null'] },
          error_message: { type: ['string', 'null'] },
          created_at: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'project_id', 'owner_id', 'status', 'model', 'created_at'],
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
          citations: { type: 'array', items: { type: 'object', additionalProperties: true } },
          cost_estimate_usd: { type: ['integer', 'null'] },
          resource_estimate: { type: 'object', additionalProperties: true },
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
          citations: { type: 'array', items: { type: 'object', additionalProperties: true } },
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
          '200': { description: 'OK' },
          '401': { $ref: '#/components/schemas/ErrorResponse' },
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
          '401': { $ref: '#/components/schemas/ErrorResponse' },
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
          '400': { $ref: '#/components/schemas/ErrorResponse' },
          '401': { $ref: '#/components/schemas/ErrorResponse' },
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
          '401': { $ref: '#/components/schemas/ErrorResponse' },
          '404': { $ref: '#/components/schemas/ErrorResponse' },
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
          '400': { $ref: '#/components/schemas/ErrorResponse' },
          '401': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/v1/projects/{projectId}/ideas': {
      get: {
        tags: ['Ideas'],
        summary: 'List ideas in a project',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', default: 50, maximum: 200 } },
          { name: 'offset', in: 'query', required: false, schema: { type: 'integer', default: 0, minimum: 0 } },
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
          '400': { $ref: '#/components/schemas/ErrorResponse' },
          '401': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/v1/ideas/{id}': {
      patch: {
        tags: ['Ideas'],
        summary: 'Update idea',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
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
                schema: { type: 'object', properties: { idea: { $ref: '#/components/schemas/Idea' } }, required: ['idea'] },
              },
            },
          },
          '400': { $ref: '#/components/schemas/ErrorResponse' },
          '401': { $ref: '#/components/schemas/ErrorResponse' },
          '404': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
      delete: {
        tags: ['Ideas'],
        summary: 'Delete idea',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '204': { description: 'No Content' },
          '401': { $ref: '#/components/schemas/ErrorResponse' },
          '404': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/v1/projects/{projectId}/playbook': {
      post: {
        tags: ['Playbook'],
        summary: 'Upsert playbook',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
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
          '201': { description: 'Created' },
          '400': { $ref: '#/components/schemas/ErrorResponse' },
          '401': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
      get: {
        tags: ['Playbook'],
        summary: 'Get playbook',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    playbook: { anyOf: [{ $ref: '#/components/schemas/Playbook' }, { type: 'null' }] },
                    chunks: { type: 'array', items: { $ref: '#/components/schemas/PlaybookChunk' } },
                  },
                  required: ['playbook', 'chunks'],
                },
              },
            },
          },
          '401': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/v1/projects/{projectId}/playbook:search': {
      post: {
        tags: ['Playbook'],
        summary: 'Semantic search in playbook chunks',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
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
          '200': { description: 'OK' },
          '401': { $ref: '#/components/schemas/ErrorResponse' },
          '404': { $ref: '#/components/schemas/ErrorResponse' },
          '409': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/v1/projects/{projectId}/runs': {
      get: {
        tags: ['Runs'],
        summary: 'List runs for a project',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
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
          '401': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
      post: {
        tags: ['Runs'],
        summary: 'Create scoring run (sync)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
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
          '201': { description: 'Created' },
          '400': { $ref: '#/components/schemas/ErrorResponse' },
          '401': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/v1/projects/{projectId}/runs:execute': {
      post: {
        tags: ['Runs'],
        summary: 'Create scoring run (async)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { $ref: '#/paths/~1v1~1projects~1{projectId}~1runs/post/requestBody' },
        responses: {
          '202': { description: 'Accepted' },
          '400': { $ref: '#/components/schemas/ErrorResponse' },
          '401': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/v1/projects/{projectId}/runs/{runId}': {
      get: {
        tags: ['Runs'],
        summary: 'Get run with scores',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
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
          '401': { $ref: '#/components/schemas/ErrorResponse' },
          '404': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/v1/projects/{projectId}/runs/{runId}/stream': {
      get: {
        tags: ['Runs'],
        summary: 'SSE stream for run progress',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'runId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'text/event-stream',
            content: { 'text/event-stream': { schema: { type: 'string' } } },
          },
          '401': { $ref: '#/components/schemas/ErrorResponse' },
          '404': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/v1/projects/{projectId}/runs/{runId}/artifacts:generate': {
      post: {
        tags: ['Artifacts'],
        summary: 'Generate artifacts for a run',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
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
          '201': { description: 'Created' },
          '400': { $ref: '#/components/schemas/ErrorResponse' },
          '401': { $ref: '#/components/schemas/ErrorResponse' },
          '409': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/v1/projects/{projectId}/runs/{runId}/artifacts:latest': {
      get: {
        tags: ['Artifacts'],
        summary: 'Get latest artifacts for a run',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'runId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'OK' },
          '401': { $ref: '#/components/schemas/ErrorResponse' },
          '404': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/v1/projects/{projectId}/runs/{runId}/artifacts': {
      get: {
        tags: ['Artifacts'],
        summary: 'List artifacts for a run',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
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
                  },
                  required: ['runId', 'artifacts'],
                },
              },
            },
          },
          '401': { $ref: '#/components/schemas/ErrorResponse' },
          '404': { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
  },
} as const
