import { useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { usePlaybook, useUpsertPlaybook } from '@/entities/playbook/api/playbook.queries'
import type { PlaybookChunk } from '@/entities/playbook/types/playbook'
import { PlaybookEditor } from '@/features/playbook/PlaybookEditor'
import { PlaybookSearchTest } from '@/features/playbook/PlaybookSearchTest'
import { useToastQueryError } from '@/shared/hooks/useToastQueryError'
import { copyToClipboard } from '@/shared/lib/clipboard'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { ErrorState } from '@/shared/ui/error-state'
import { Separator } from '@/shared/ui/separator'

export function ProjectPlaybookTab() {
  const { projectId } = useParams()
  const pid = projectId ?? ''
  const [searchParams, setSearchParams] = useSearchParams()
  const chunkId = searchParams.get('chunkId') ?? ''

  const pbQuery = usePlaybook(pid)
  const upsert = useUpsertPlaybook(pid)

  useToastQueryError(pbQuery.isError, pbQuery.error, 'Failed to load playbook.')

  async function onSave(values: { title: string; content: string }) {
    await upsert.mutateAsync(values)
  }

  const chunks = useMemo(() => {
    return (pbQuery.data?.chunks ?? []).slice().sort((a, b) => a.chunk_index - b.chunk_index)
  }, [pbQuery.data?.chunks])

  useEffect(() => {
    if (!chunkId) return
    if (chunks.length === 0) return
    const el = document.getElementById(`chunk-${chunkId}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [chunkId, chunks.length])

  async function onCopyChunkId(id: string) {
    try {
      await copyToClipboard(id)
      toast.success('Chunk id copied.')
    } catch (e) {
      toast.error('Copy failed.')
      console.error(e)
    }
  }

  async function onCopyChunkLink(id: string) {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev)
        next.set('chunkId', id)
        return next
      },
      { replace: true }
    )

    try {
      const url = `${window.location.origin}/projects/${pid}/playbook?chunkId=${id}`
      await copyToClipboard(url)
      toast.success('Link copied.')
    } catch (e) {
      toast.error('Copy failed.')
      console.error(e)
    }
  }

  function onClearChunkLink() {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev)
        next.delete('chunkId')
        return next
      },
      { replace: true }
    )
  }

  if (pbQuery.isLoading) {
    return <div className="h-40 animate-pulse rounded-md bg-muted" />
  }

  if (pbQuery.isError) {
    return (
      <ErrorState
        title="Failed to load playbook"
        message={
          pbQuery.error instanceof Error ? pbQuery.error.message : 'Failed to load playbook.'
        }
        onRetry={() => void pbQuery.refetch()}
        isRetrying={pbQuery.isFetching}
      />
    )
  }

  return (
    <div className="space-y-4">
      <PlaybookEditor
        projectId={pid}
        initial={pbQuery.data ?? null}
        onSave={onSave}
        isPending={upsert.isPending}
      />

      <PlaybookSearchTest projectId={pid} hasChunks={chunks.length > 0} />

      <ChunksCard
        chunks={chunks}
        highlightedChunkId={chunkId}
        onCopyChunkId={onCopyChunkId}
        onCopyChunkLink={onCopyChunkLink}
        onClearChunkLink={onClearChunkLink}
      />
    </div>
  )
}

function ChunksCard({
  chunks,
  highlightedChunkId,
  onCopyChunkId,
  onCopyChunkLink,
  onClearChunkLink,
}: {
  chunks: PlaybookChunk[]
  highlightedChunkId: string
  onCopyChunkId: (id: string) => Promise<void>
  onCopyChunkLink: (id: string) => Promise<void>
  onClearChunkLink: () => void
}) {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-base font-semibold">Chunks</h3>
            <p className="text-sm text-muted-foreground">
              Chunks are generated from your playbook and used for citations. Artifact “Sources”
              links jump here so you can verify what the model referenced.
            </p>
          </div>
          {highlightedChunkId ? (
            <Button variant="outline" size="sm" onClick={onClearChunkLink}>
              Clear highlight
            </Button>
          ) : null}
        </div>

        <Separator />

        {chunks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No chunks yet. Upload a playbook to generate them.
          </p>
        ) : (
          <div className="space-y-3">
            {chunks.map(c => (
              <ChunkRow
                key={c.id}
                chunk={c}
                highlighted={c.id === highlightedChunkId}
                onCopyChunkId={onCopyChunkId}
                onCopyChunkLink={onCopyChunkLink}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

function ChunkRow({
  chunk,
  highlighted,
  onCopyChunkId,
  onCopyChunkLink,
}: {
  chunk: PlaybookChunk
  highlighted: boolean
  onCopyChunkId: (id: string) => Promise<void>
  onCopyChunkLink: (id: string) => Promise<void>
}) {
  const title = chunk.chunk_title?.trim() ? chunk.chunk_title : `Chunk ${chunk.chunk_index + 1}`
  const classes = [
    'rounded-md border p-3 scroll-mt-24',
    highlighted ? 'border-primary/50 bg-primary/5 ring-2 ring-primary/20' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div id={`chunk-${chunk.id}`} className={classes}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="text-sm font-medium">{title}</div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Сhunk ID</span>
            <Badge variant="secondary" className="font-mono">
              {chunk.id}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void onCopyChunkId(chunk.id)}>
            Copy id
          </Button>
          <Button variant="outline" size="sm" onClick={() => void onCopyChunkLink(chunk.id)}>
            Copy link
          </Button>
        </div>
      </div>

      <div className="mt-2 max-h-56 overflow-auto rounded-md bg-muted p-2 font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {chunk.chunk_text}
      </div>
    </div>
  )
}
