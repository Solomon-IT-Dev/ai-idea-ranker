import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { usePlaybook, useUpsertPlaybook } from '@/entities/playbook/api/playbook.queries'
import { useToastQueryError } from '@/shared/hooks/useToastQueryError'
import { copyToClipboard } from '@/shared/lib/clipboard'
import { deleteSearchParam, setSearchParam } from '@/shared/lib/searchParams'

export function useProjectPlaybookController(projectId: string) {
  const [searchParams, setSearchParams] = useSearchParams()
  const highlightedChunkId = searchParams.get('chunkId') ?? ''

  const playbookQuery = usePlaybook(projectId)
  const upsertMutation = useUpsertPlaybook(projectId)

  useToastQueryError(playbookQuery.isError, playbookQuery.error, 'Failed to load playbook.')

  const chunks = useMemo(() => {
    return (playbookQuery.data?.chunks ?? []).slice().sort((a, b) => a.chunk_index - b.chunk_index)
  }, [playbookQuery.data?.chunks])

  useEffect(() => {
    if (!highlightedChunkId || chunks.length === 0) return
    const element = document.getElementById(`chunk-${highlightedChunkId}`)
    if (!element) return
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlightedChunkId, chunks.length])

  async function savePlaybook(values: { title: string; content: string }) {
    await upsertMutation.mutateAsync(values)
  }

  async function copyChunkId(id: string) {
    try {
      await copyToClipboard(id)
      toast.success('Chunk id copied.')
    } catch {
      toast.error('Copy failed.')
    }
  }

  async function copyChunkLink(id: string) {
    setSearchParam(setSearchParams, 'chunkId', id)

    try {
      const url = `${window.location.origin}/projects/${projectId}/playbook?chunkId=${id}`
      await copyToClipboard(url)
      toast.success('Link copied.')
    } catch {
      toast.error('Copy failed.')
    }
  }

  function clearChunkLink() {
    deleteSearchParam(setSearchParams, 'chunkId')
  }

  return {
    playbookQuery,
    upsertMutation,
    chunks,
    highlightedChunkId,
    savePlaybook,
    copyChunkId,
    copyChunkLink,
    clearChunkLink,
  }
}
