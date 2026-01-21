import { Badge } from '@/shared/ui/badge'
import { Card } from '@/shared/ui/card'

type Props = {
  name: string
  constraints?: {
    budget?: number
    team?: { fe?: number; be?: number; ds?: number }
  } | null
}

export function ProjectHeader({ name, constraints }: Props) {
  const budget = constraints?.budget
  const team = constraints?.team

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{name}</h1>
          <p className="text-sm text-muted-foreground">
            Manage ideas, playbook, runs, and artifacts for this project.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {typeof budget === 'number' && <Badge variant="secondary">Budget: ${budget}</Badge>}
          {(team?.fe || team?.be || team?.ds) && (
            <Badge variant="secondary">
              Team: FE {team?.fe ?? 0} · BE {team?.be ?? 0}
              {typeof team?.ds === 'number' ? ` · DS ${team.ds}` : ''}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
