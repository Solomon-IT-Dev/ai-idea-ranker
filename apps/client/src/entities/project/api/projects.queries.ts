import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError } from '@/shared/api/http'

import { createProject, deleteProject, getProject, listProjects } from './projects.api'

export const projectKeys = {
  all: ['projects'] as const,
  byId: (projectId: string) => ['projects', 'byId', projectId] as const,
}

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: listProjects,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: projectKeys.all })
      toast.success('Project created')
    },
    onError: err => {
      const e = err as ApiError
      toast.error(e.message)
    },
  })
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.byId(projectId),
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId),
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: async (_data, projectId) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: projectKeys.all }),
        qc.invalidateQueries({ queryKey: projectKeys.byId(projectId) }),
      ])
      toast.success('Project deleted')
    },
    onError: err => {
      const e = err as ApiError
      toast.error(e.message)
    },
  })
}
