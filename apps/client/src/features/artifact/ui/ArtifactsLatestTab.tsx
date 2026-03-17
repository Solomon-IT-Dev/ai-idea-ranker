import { buildArtifactsBundleMarkdown } from '@/entities/artifact/lib/artifactExport'
import type { Artifact } from '@/entities/artifact/types/artifact'
import { ArtifactActionsMenu } from '@/entities/artifact/ui/ArtifactActionsMenu'
import { ArtifactMarkdownCard } from '@/entities/artifact/ui/ArtifactMarkdownCard'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ErrorState } from '@/shared/ui/error-state'

type Props = {
  projectId: string
  runId: string
  isLoading: boolean
  isError: boolean
  errorMessage: string
  isFetching: boolean
  latestPlan: Artifact | null
  latestCard: Artifact | null
  onRetry: () => void
  onCopy: (markdown?: string | null) => void
  onExport: (filename: string, markdown?: string | null) => void
}

export function ArtifactsLatestTab({
  projectId,
  runId,
  isLoading,
  isError,
  errorMessage,
  isFetching,
  latestPlan,
  latestCard,
  onRetry,
  onCopy,
  onExport,
}: Props) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-72 animate-pulse rounded-md bg-muted" />
        <div className="h-72 animate-pulse rounded-md bg-muted" />
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load latest artifacts"
        message={errorMessage}
        onRetry={onRetry}
        isRetrying={isFetching}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-sm font-semibold">Latest artifacts</div>
            <p className="text-sm text-muted-foreground">
              The most recent plan and experiment card for this run.
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Copy / export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>All</DropdownMenuLabel>
              <DropdownMenuItem
                disabled={!latestPlan && !latestCard}
                onSelect={event => {
                  event.preventDefault()
                  onCopy(
                    buildArtifactsBundleMarkdown({
                      title: `Artifacts — run ${runId}`,
                      plan: latestPlan ? { md: latestPlan.content_markdown } : null,
                      card: latestCard ? { md: latestCard.content_markdown } : null,
                    })
                  )
                }}
              >
                Copy both
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!latestPlan && !latestCard}
                onSelect={event => {
                  event.preventDefault()
                  onExport(
                    `artifacts-${runId}-latest.md`,
                    buildArtifactsBundleMarkdown({
                      title: `Artifacts — run ${runId}`,
                      plan: latestPlan ? { md: latestPlan.content_markdown } : null,
                      card: latestCard ? { md: latestCard.content_markdown } : null,
                    })
                  )
                }}
              >
                Export both
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Plan</DropdownMenuLabel>
              <DropdownMenuItem
                disabled={!latestPlan}
                onSelect={event => {
                  event.preventDefault()
                  onCopy(latestPlan?.content_markdown ?? null)
                }}
              >
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!latestPlan}
                onSelect={event => {
                  event.preventDefault()
                  onExport(
                    `artifact-plan-${runId}-${latestPlan?.id ?? 'latest'}.md`,
                    latestPlan?.content_markdown ?? null
                  )
                }}
              >
                Export
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Experiment Card</DropdownMenuLabel>
              <DropdownMenuItem
                disabled={!latestCard}
                onSelect={event => {
                  event.preventDefault()
                  onCopy(latestCard?.content_markdown ?? null)
                }}
              >
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!latestCard}
                onSelect={event => {
                  event.preventDefault()
                  onExport(
                    `artifact-experiment-card-${runId}-${latestCard?.id ?? 'latest'}.md`,
                    latestCard?.content_markdown ?? null
                  )
                }}
              >
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">30-60-90 Plan</div>
            <ArtifactActionsMenu
              label="Plan"
              canCopy={Boolean(latestPlan)}
              onCopy={() => onCopy(latestPlan?.content_markdown ?? null)}
              onExport={() =>
                onExport(
                  `artifact-plan-${runId}-${latestPlan?.id ?? 'latest'}.md`,
                  latestPlan?.content_markdown ?? null
                )
              }
            />
          </div>
          {latestPlan ? (
            <ArtifactMarkdownCard
              title="Latest plan"
              markdown={latestPlan.content_markdown}
              projectId={projectId}
              variant="latest"
            />
          ) : (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">No plan yet.</p>
            </Card>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Experiment Card</div>
            <ArtifactActionsMenu
              label="Experiment card"
              canCopy={Boolean(latestCard)}
              onCopy={() => onCopy(latestCard?.content_markdown ?? null)}
              onExport={() =>
                onExport(
                  `artifact-experiment-card-${runId}-${latestCard?.id ?? 'latest'}.md`,
                  latestCard?.content_markdown ?? null
                )
              }
            />
          </div>
          {latestCard ? (
            <ArtifactMarkdownCard
              title="Latest experiment card"
              markdown={latestCard.content_markdown}
              projectId={projectId}
              variant="latest"
            />
          ) : (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">No experiment card yet.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
