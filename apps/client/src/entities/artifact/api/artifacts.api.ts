import type {
  GenerateArtifactsResponse,
  LatestArtifactsResponse,
  ListArtifactsResponse,
} from '@/entities/artifact/types/artifact'
import { apiFetch } from '@/shared/api/http'

export async function listArtifacts(params: { projectId: string; runId: string }) {
  return apiFetch<ListArtifactsResponse>(`/v1/projects/${params.projectId}/runs/${params.runId}/artifacts`)
}

export async function getLatestArtifacts(params: { projectId: string; runId: string }) {
  return apiFetch<LatestArtifactsResponse>(
    `/v1/projects/${params.projectId}/runs/${params.runId}/artifacts:latest`
  )
}

export async function generateArtifacts(params: {
  projectId: string
  runId: string
  topN: number
}) {
  return apiFetch<GenerateArtifactsResponse>(
    `/v1/projects/${params.projectId}/runs/${params.runId}/artifacts:generate`,
    {
      method: 'POST',
      json: { topN: params.topN },
    }
  )
}
