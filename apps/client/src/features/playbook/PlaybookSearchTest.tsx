import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { usePlaybookSearch } from '@/entities/playbook/api/playbook.queries'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

type Props = { projectId: string }

export function PlaybookSearchTest({ projectId }: Props) {
  const { register, handleSubmit, watch } = useForm<{ query: string }>({
    defaultValues: { query: '' },
  })

  const query = watch('query')
  const mutation = usePlaybookSearch(projectId)

  const isDisabled = useMemo(() => !query.trim() || mutation.isPending, [query, mutation.isPending])

  async function submit(values: { query: string }) {
    try {
      await mutation.mutateAsync({ query: values.query, topK: 5, includeText: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const msg = e?.message ?? 'Search failed.'
      toast.error(msg)
    }
  }

  const results = mutation.data?.results ?? []

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">Playbook search (RAG)</h3>
          <p className="text-sm text-muted-foreground">
            Semantic search over playbook chunks (pgvector). Useful to verify citations.
          </p>
        </div>

        <div className="flex gap-2">
          <Input placeholder="e.g., success metrics" {...register('query')} />
          <Button onClick={handleSubmit(submit)} disabled={isDisabled}>
            {mutation.isPending ? 'Searching…' : 'Search'}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map(r => (
              <div key={r.chunkId} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{r.title ?? `Chunk #${r.chunkIndex}`}</span>
                  <span className="text-muted-foreground">{r.score.toFixed(3)}</span>
                </div>
                {r.text ? (
                  <p className="mt-2 text-muted-foreground">{truncate(r.text, 240)}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n)}…` : s
}
