import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useRuns, useStartRun } from '@/entities/run/api/runs.queries'
import { type StartRunFormValues } from '@/features/run/model/startRunForm'
import { RunHistoryTable } from '@/features/run/ui/RunHistoryTable'
import { StartRunForm } from '@/features/run/ui/StartRunForm'
import { useToastQueryError } from '@/shared/hooks/useToastQueryError'

export function ProjectRunsTab() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const pid = projectId ?? ''
  const runsQuery = useRuns(pid)
  const startRun = useStartRun(pid)

  useToastQueryError(runsQuery.isError, runsQuery.error, 'Failed to load runs.')

  async function onStart(values: StartRunFormValues) {
    if (!pid) return

    try {
      const res = await startRun.mutateAsync({
        topN: values.topN,
        weights: {
          impact: values.impact,
          effort: values.effort,
          risk: values.risk,
          dataReadiness: values.dataReadiness,
        },
      })

      toast.success('Run started. Opening details…')
      navigate(`/projects/${pid}/runs/${res.run.id}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to start run.')
    }
  }

  return (
    <div className="space-y-4">
      <StartRunForm isPending={startRun.isPending} onSubmit={onStart} />

      <RunHistoryTable
        runs={runsQuery.data?.runs ?? []}
        isLoading={runsQuery.isLoading}
        isError={runsQuery.isError}
        isFetching={runsQuery.isFetching}
        error={runsQuery.error}
        onRetry={() => void runsQuery.refetch()}
        onRefresh={() => void runsQuery.refetch()}
        onOpenRun={runId => navigate(`/projects/${pid}/runs/${runId}`)}
      />
    </div>
  )
}
