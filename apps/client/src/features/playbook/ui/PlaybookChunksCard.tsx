import type { PlaybookChunk } from '@/entities/playbook/types/playbook'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'

type Props = {
  chunks: PlaybookChunk[]
  highlightedChunkId: string
  onCopyChunkId: (id: string) => Promise<void>
  onCopyChunkLink: (id: string) => Promise<void>
  onClearChunkLink: () => void
}

export function PlaybookChunksCard({
  chunks,
  highlightedChunkId,
  onCopyChunkId,
  onCopyChunkLink,
  onClearChunkLink,
}: Props) {
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
            {chunks.map(chunk => (
              <PlaybookChunkRow
                key={chunk.id}
                chunk={chunk}
                highlighted={chunk.id === highlightedChunkId}
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

function PlaybookChunkRow({
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
            <span>Chunk ID</span>
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
