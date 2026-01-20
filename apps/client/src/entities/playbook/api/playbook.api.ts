import type {
  GetPlaybookResponse,
  PlaybookSearchResult,
  UpsertPlaybookBody,
} from '@/entities/playbook/types/playbook'
import { apiFetch } from '@/shared/api/http'

export async function getPlaybook(projectId: string) {
  return apiFetch<GetPlaybookResponse>(`/v1/projects/${projectId}/playbook`)
}

export async function upsertPlaybook(projectId: string, body: UpsertPlaybookBody) {
  return apiFetch<GetPlaybookResponse>(`/v1/projects/${projectId}/playbook`, {
    method: 'POST',
    json: body,
  })
}

export async function searchPlaybook(
  projectId: string,
  body: { query: string; topK?: number; includeText?: boolean }
) {
  return apiFetch<{
    query: string
    topK: number
    results: PlaybookSearchResult[]
  }>(`/v1/projects/${projectId}/playbook:search`, {
    method: 'POST',
    json: {
      query: body.query,
      topK: body.topK ?? 5,
      includeText: body.includeText ?? true,
    },
  })
}
