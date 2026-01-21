import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { generateArtifacts, getLatestArtifacts, listArtifacts } from './artifacts.api'

export const artifactKeys = {
  root: ['artifacts'] as const,
  list: (projectId: string, runId: string) =>
    [...artifactKeys.root, 'list', projectId, runId] as const,
  latest: (projectId: string, runId: string) =>
    [...artifactKeys.root, 'latest', projectId, runId] as const,
}

export function useArtifactsLatest(projectId: string, runId: string, enabled = true) {
  return useQuery({
    queryKey: artifactKeys.latest(projectId, runId),
    queryFn: () => getLatestArtifacts({ projectId, runId }),
    enabled: enabled && Boolean(projectId && runId),
  })
}

export function useArtifactsList(projectId: string, runId: string, enabled = true) {
  return useQuery({
    queryKey: artifactKeys.list(projectId, runId),
    queryFn: () => listArtifacts({ projectId, runId }),
    enabled: enabled && Boolean(projectId && runId),
  })
}

export function useGenerateArtifactsMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (params: { projectId: string; runId: string; topN: number }) =>
      generateArtifacts(params),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: artifactKeys.latest(vars.projectId, vars.runId) })
      await qc.invalidateQueries({ queryKey: artifactKeys.list(vars.projectId, vars.runId) })
    },
  })
}
