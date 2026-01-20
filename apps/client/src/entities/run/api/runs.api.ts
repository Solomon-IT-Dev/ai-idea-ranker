import type {
  RunGetResponse,
  RunsListResponse,
  RunWeights,
  StartRunResponse,
} from '@/entities/run/types/run'
import { apiFetch } from '@/shared/api/http'

import { routes } from './runs.routes'

export async function listRuns(projectId: string) {
  return apiFetch<RunsListResponse>(routes.listRuns(projectId))
}

export async function getRun(projectId: string, runId: string) {
  return apiFetch<RunGetResponse>(routes.getRun(projectId, runId))
}

export async function startRun(
  projectId: string,
  body: { topN?: number; weights?: Partial<RunWeights> }
) {
  return apiFetch<StartRunResponse>(routes.startRun(projectId), {
    method: 'POST',
    json: {
      topN: body.topN ?? 5,
      weights: {
        impact: body.weights?.impact ?? 1,
        effort: body.weights?.effort ?? 1,
        risk: body.weights?.risk ?? 1,
        dataReadiness: body.weights?.dataReadiness ?? 1,
      },
    },
  })
}
