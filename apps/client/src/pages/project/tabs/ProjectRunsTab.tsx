import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { useRuns, useStartRun } from '@/entities/run/api/runs.queries'
import { zodResolver } from '@/shared/lib/zodResolver'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

const schema = z.object({
  topN: z.coerce.number().int().min(1).max(20).default(5),
  impact: z.coerce.number().min(0).max(5).default(1),
  effort: z.coerce.number().min(0).max(5).default(1),
  risk: z.coerce.number().min(0).max(5).default(1),
  dataReadiness: z.coerce.number().min(0).max(5).default(1),
})

type FormValues = z.infer<typeof schema>

export function ProjectRunsTab() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const pid = projectId ?? ''
  const runsQuery = useRuns(pid)
  const startRun = useStartRun(pid)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { topN: 5, impact: 1, effort: 1, risk: 1, dataReadiness: 1 },
  })

  const runs = runsQuery.data?.runs ?? []
  const sortedRuns = useMemo(() => {
    return [...runs].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  }, [runs])

  async function onStart(values: FormValues) {
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

      toast.success('Run started.')
      navigate(`/projects/${pid}/runs/${res.run.id}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to start run.')
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Runs</h2>
            <p className="text-sm text-muted-foreground">
              Start a scoring run (uses playbook RAG for citations) and track progress via SSE.
            </p>
          </div>
        </div>

        <form className="mt-4 grid gap-3 md:grid-cols-6" onSubmit={form.handleSubmit(onStart)}>
          <div className="space-y-1 md:col-span-1">
            <Label>Top N</Label>
            <Input {...form.register('topN')} />
          </div>

          <div className="space-y-1 md:col-span-1">
            <Label>Impact</Label>
            <Input {...form.register('impact')} />
          </div>

          <div className="space-y-1 md:col-span-1">
            <Label>Effort</Label>
            <Input {...form.register('effort')} />
          </div>

          <div className="space-y-1 md:col-span-1">
            <Label>Risk</Label>
            <Input {...form.register('risk')} />
          </div>

          <div className="space-y-1 md:col-span-1">
            <Label>Data readiness</Label>
            <Input {...form.register('dataReadiness')} />
          </div>

          <div className="md:col-span-1 flex items-end">
            <Button type="submit" className="w-full" disabled={startRun.isPending}>
              {startRun.isPending ? 'Starting…' : 'Start run'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">History</h3>
          <Button
            variant="outline"
            onClick={() => runsQuery.refetch()}
            disabled={runsQuery.isFetching}
          >
            Refresh
          </Button>
        </div>

        <div className="mt-3 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Top N</TableHead>
                <TableHead className="text-right">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRuns.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{r.model}</TableCell>
                  <TableCell>{r.top_n}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/projects/${pid}/runs/${r.id}`)}
                    >
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {sortedRuns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No runs yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
