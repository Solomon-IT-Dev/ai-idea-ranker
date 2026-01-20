import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getRun, listRuns, startRun } from './runs.api'

export const runKeys = {
  all: (projectId: string) => ['runs', projectId] as const,
  byId: (projectId: string, runId: string) => ['runs', projectId, runId] as const,
}

export function useRuns(projectId: string) {
  return useQuery({
    queryKey: runKeys.all(projectId),
    queryFn: () => listRuns(projectId),
    enabled: Boolean(projectId),
  })
}

export function useRun(projectId: string, runId: string) {
  return useQuery({
    queryKey: runKeys.byId(projectId, runId),
    queryFn: () => getRun(projectId, runId),
    enabled: Boolean(projectId && runId),
    refetchOnWindowFocus: false,
  })
}

export function useStartRun(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (body: { topN?: number; weights?: any }) => startRun(projectId, body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: runKeys.all(projectId) })
    },
  })
}
