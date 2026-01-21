import { KEY_ARTIFACTS_LAST_RUN_PREFIX, KEY_LAST_PROJECT } from '@/shared/constants/storage'

export function setLastProjectId(projectId: string) {
  localStorage.setItem(KEY_LAST_PROJECT, projectId)
}

export function getLastProjectId(): string | null {
  return localStorage.getItem(KEY_LAST_PROJECT)
}

export function clearLastProjectId() {
  localStorage.removeItem(KEY_LAST_PROJECT)
}

export function setArtifactsLastRunId(projectId: string, runId: string) {
  localStorage.setItem(`${KEY_ARTIFACTS_LAST_RUN_PREFIX}${projectId}`, runId)
}

export function getArtifactsLastRunId(projectId: string): string | null {
  return localStorage.getItem(`${KEY_ARTIFACTS_LAST_RUN_PREFIX}${projectId}`)
}

export function clearArtifactsLastRunId(projectId: string) {
  localStorage.removeItem(`${KEY_ARTIFACTS_LAST_RUN_PREFIX}${projectId}`)
}
