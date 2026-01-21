import type { Project, ProjectConstraints } from '@/entities/project/types/project'
import { apiFetch } from '@/shared/api/http'

export type { Project, ProjectConstraints }

export async function listProjects() {
  return apiFetch<{ projects: Project[] }>('/v1/projects')
}

export async function createProject(input: { name: string; constraints: ProjectConstraints }) {
  return apiFetch<{ project: Project }>('/v1/projects', { method: 'POST', json: input })
}

export async function getProject(projectId: string) {
  return apiFetch<{ project: Project }>(`/v1/projects/${projectId}`)
}

export async function deleteProject(projectId: string) {
  return apiFetch<void>(`/v1/projects/${projectId}`, { method: 'DELETE' })
}
