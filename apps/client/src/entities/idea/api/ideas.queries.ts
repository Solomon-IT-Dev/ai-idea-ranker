import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteIdea, importIdeas, listIdeas, updateIdea } from './ideas.api'

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

export function useUpdateIdea(projectId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: { ideaId: string; patch: Parameters<typeof updateIdea>[1] }) =>
      updateIdea(input.ideaId, input.patch),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ideaKeys.all(projectId) })
    },
  })
}

export function useDeleteIdea(projectId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (ideaId: string) => deleteIdea(ideaId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ideaKeys.all(projectId) })
    },
  })
}
