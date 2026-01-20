import { useParams } from 'react-router-dom'

import { usePlaybook, useUpsertPlaybook } from '@/entities/playbook/api/playbook.queries'
import { PlaybookEditor } from '@/features/playbook/PlaybookEditor'
// Optional
import { PlaybookSearchTest } from '@/features/playbook/PlaybookSearchTest'

export function ProjectPlaybookTab() {
  const { projectId } = useParams()
  const pid = projectId ?? ''

  const pbQuery = usePlaybook(pid)
  const upsert = useUpsertPlaybook(pid)

  async function onSave(values: { title: string; content: string }) {
    await upsert.mutateAsync(values)
  }

  if (pbQuery.isLoading) {
    return <div className="h-40 animate-pulse rounded-md bg-muted" />
  }

  return (
    <div className="space-y-4">
      <PlaybookEditor initial={pbQuery.data ?? null} onSave={onSave} isPending={upsert.isPending} />

      {/* Optional: keep it if retrieval endpoint exists; otherwise comment out */}
      <PlaybookSearchTest projectId={pid} />
    </div>
  )
}
