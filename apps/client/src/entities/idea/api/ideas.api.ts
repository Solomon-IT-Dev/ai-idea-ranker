import type { Idea, ImportIdeasBody } from '@/entities/idea/types/idea'
import { apiFetch } from '@/shared/api/http'

export async function listIdeas(projectId: string) {
  return apiFetch<{ ideas: Idea[] }>(`/v1/projects/${projectId}/ideas`)
}

export async function importIdeas(projectId: string, body: ImportIdeasBody) {
  return apiFetch<{ ideas?: Idea[]; imported?: number }>(`/v1/projects/${projectId}/ideas:import`, {
    method: 'POST',
    json: body,
  })
}
