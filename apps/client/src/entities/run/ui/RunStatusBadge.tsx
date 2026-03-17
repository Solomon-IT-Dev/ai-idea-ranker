import { getRunStatusBadgeVariant, getRunStatusLabel } from '@/entities/run/lib/runStatus'
import { Badge } from '@/shared/ui/badge'

export function RunStatusBadge({ status }: { status: string | undefined }) {
  return <Badge variant={getRunStatusBadgeVariant(status)}>{getRunStatusLabel(status)}</Badge>
}
