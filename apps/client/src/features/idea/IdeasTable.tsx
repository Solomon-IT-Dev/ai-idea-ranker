import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'

import type { Idea } from '@/entities/idea/types/idea'

import { IdeaRowActions } from '@/features/idea/IdeaRowActions'
import { formatDateTime } from '@/shared/lib/date'
import { truncateText } from '@/shared/lib/text'
import { Card } from '@/shared/ui/card'

type Props = {
  ideas: Idea[]
}

const ch = createColumnHelper<Idea>()

export function IdeasTable({ ideas }: Props) {
  const columns = useMemo(
    () => [
      ch.accessor('title', {
        header: 'Title',
        cell: info => <span className="font-medium">{info.getValue()}</span>,
      }),
      ch.accessor('raw_text', {
        header: 'Text',
        cell: info => <span className="text-muted-foreground">{truncateText(info.getValue(), 120)}</span>,
      }),
      ch.accessor('created_at', {
        header: 'Created',
        cell: info => <span className="text-muted-foreground">{formatDateTime(info.getValue())}</span>,
      }),
      ch.display({
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: info => (
          <div className="flex justify-end">
            <IdeaRowActions idea={info.row.original} />
          </div>
        ),
      }),
    ],
    []
  )

  const table = useReactTable({
    data: ideas,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Card className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th
                    key={h.id}
                    className={`px-4 py-3 font-medium ${h.column.id === 'actions' ? 'text-right' : 'text-left'}`}
                  >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map(r => (
              <tr key={r.id} className="border-b last:border-b-0">
                {r.getVisibleCells().map(c => (
                  <td
                    key={c.id}
                    className={`px-4 py-3 align-top ${c.column.id === 'actions' ? 'text-right' : ''}`}
                  >
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))}

            {ideas.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={columns.length}>
                  No ideas yet. Import a few to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
