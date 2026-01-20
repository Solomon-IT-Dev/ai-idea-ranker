export const routes = {
  // Runs
  listRuns: (projectId: string) => `/v1/projects/${projectId}/runs`,
  getRun: (projectId: string, runId: string) => `/v1/projects/${projectId}/runs/${runId}`,

  /**
   * Start run asynchronously.
   */
  startRun: (projectId: string) => `/v1/projects/${projectId}/runs:execute`,

  /**
   * SSE stream endpoint.
   */
  streamRun: (projectId: string, runId: string) => `/v1/projects/${projectId}/runs/${runId}/stream`,
} as const
