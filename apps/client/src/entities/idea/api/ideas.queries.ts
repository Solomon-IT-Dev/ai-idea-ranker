import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { importIdeas, listIdeas } from './ideas.api'

export const ideaKeys = {
  all: (projectId: string) => ['ideas', projectId] as const,
}

export function useIdeas(projectId: string) {
  return useQuery({
    queryKey: ideaKeys.all(projectId),
    queryFn: () => listIdeas(projectId),
    enabled: Boolean(projectId),
  })
}

export function useImportIdeas(projectId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (text: string) => importIdeas(projectId, { text }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ideaKeys.all(projectId) })
    },
  })
}
