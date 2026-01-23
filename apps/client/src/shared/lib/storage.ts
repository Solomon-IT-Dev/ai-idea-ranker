import {
  KEY_ARTIFACTS_LAST_RUN_PREFIX,
  KEY_LAST_PROJECT,
  KEY_PLAYBOOK_EDITOR_MODE_PREFIX,
} from '@/shared/constants/storage'

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

export function setPlaybookEditorMode(projectId: string, mode: 'edit' | 'preview') {
  localStorage.setItem(`${KEY_PLAYBOOK_EDITOR_MODE_PREFIX}${projectId}`, mode)
}

export function getPlaybookEditorMode(projectId: string): 'edit' | 'preview' | null {
  const v = localStorage.getItem(`${KEY_PLAYBOOK_EDITOR_MODE_PREFIX}${projectId}`)
  return v === 'edit' || v === 'preview' ? v : null
}
