import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getPlaybook, searchPlaybook, upsertPlaybook } from './playbook.api'

export const playbookKeys = {
  root: (projectId: string) => ['playbook', projectId] as const,
}

export function usePlaybook(projectId: string) {
  return useQuery({
    queryKey: playbookKeys.root(projectId),
    queryFn: () => getPlaybook(projectId),
    enabled: Boolean(projectId),
  })
}

export function useUpsertPlaybook(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { title: string; content: string }) => upsertPlaybook(projectId, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: playbookKeys.root(projectId) })
    },
  })
}

export function usePlaybookSearch(projectId: string) {
  return useMutation({
    mutationFn: (input: { query: string; topK?: number; includeText?: boolean }) =>
      searchPlaybook(projectId, input),
  })
}
