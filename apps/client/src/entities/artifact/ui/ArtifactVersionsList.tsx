import { useMemo } from 'react'

import type { Artifact } from '@/entities/artifact/types/artifact'
import { formatDateTime } from '@/shared/lib/date'

type Props = {
  artifacts: Artifact[]
  selectedId: string | null
  latestId: string | null
  onSelect: (id: string) => void
}

export function ArtifactVersionsList({ artifacts, selectedId, latestId, onSelect }: Props) {
  const sorted = useMemo(
    () => [...artifacts].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [artifacts]
  )

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground">No versions yet.</p>
  }

  return (
    <div className="space-y-2">
      {sorted.map(artifact => {
        const isSelected = artifact.id === selectedId
        const isLatest = artifact.id === latestId

        const classes = [
          'w-full rounded-md border p-3 text-left hover:bg-muted transition-colors',
          isSelected ? 'border-ring' : '',
          !isSelected && isLatest ? 'border-primary/40' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <button
            key={artifact.id}
            className={classes}
            type="button"
            onClick={() => onSelect(artifact.id)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(artifact.id)
              }
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-medium">
                    {artifact.type === 'plan_30_60_90' ? 'Plan' : 'Experiment Card'}
                  </div>
                  {isLatest ? (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                      Latest
                    </span>
                  ) : null}
                  {isSelected ? (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Selected</span>
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDateTime(artifact.created_at)}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{artifact.id.slice(0, 8)}…</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
