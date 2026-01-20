import type {
  ImportIdeasBody,
  ImportIdeasResponse,
  ListIdeasResponse,
  UpdateIdeaBody,
  UpdateIdeaResponse,
} from '@/entities/idea/types/idea'
import { apiFetch } from '@/shared/api/http'

export async function listIdeas(projectId: string) {
  return apiFetch<ListIdeasResponse>(`/v1/projects/${projectId}/ideas`)
}

export async function importIdeas(projectId: string, body: ImportIdeasBody) {
  return apiFetch<ImportIdeasResponse>(`/v1/projects/${projectId}/ideas:import`, {
    method: 'POST',
    json: body,
  })
}

export async function updateIdea(ideaId: string, body: UpdateIdeaBody) {
  return apiFetch<UpdateIdeaResponse>(`/v1/ideas/${ideaId}`, {
    method: 'PATCH',
    json: body,
  })
}

export async function deleteIdea(ideaId: string) {
  await apiFetch<null>(`/v1/ideas/${ideaId}`, { method: 'DELETE' })
}
