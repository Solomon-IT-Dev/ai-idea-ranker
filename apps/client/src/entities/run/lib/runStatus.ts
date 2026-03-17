export type RunStatusBadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'

export function getRunStatusBadgeVariant(status: string | undefined): RunStatusBadgeVariant {
  if (status === 'completed') return 'default'
  if (status === 'running') return 'secondary'
  if (status === 'failed') return 'destructive'
  return 'outline'
}

export function getRunStatusLabel(status: string | undefined): string {
  if (!status) return 'Loading'
  if (status === 'running') return 'Running'
  if (status === 'completed') return 'Completed'
  if (status === 'failed') return 'Failed'
  return status
}
