import { KEY_LAST_PROJECT } from '@/shared/constants/storage'

export function setLastProjectId(projectId: string) {
  localStorage.setItem(KEY_LAST_PROJECT, projectId)
}

export function getLastProjectId(): string | null {
  return localStorage.getItem(KEY_LAST_PROJECT)
}

export function clearLastProjectId() {
  localStorage.removeItem(KEY_LAST_PROJECT)
}
