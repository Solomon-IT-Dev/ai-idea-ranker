import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'

import type { Idea } from '@/entities/idea/types/idea'
import { IdeaRowActions } from '@/features/idea/IdeaRowActions'
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
        cell: info => (
          <span className="text-muted-foreground">{truncate(info.getValue(), 120)}</span>
        ),
      }),
	      ch.accessor('created_at', {
	        header: 'Created',
	        cell: info => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
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

/**
 * Truncates a given string to a maximum length of n.
 * If the string is shorter than n, returns the original string.
 * If the string is longer than n, returns a truncated version of the string
 * with an ellipsis ('...') appended to the end.
 *
 * @param {string} s - The string to truncate.
 * @param {number} n - The maximum length of the string.
 * @returns {string} The truncated string.
 */
function truncate(s: string, n: number) {
  if (!s) return ''
  return s.length > n ? `${s.slice(0, n)}…` : s
}

/**
 * Returns a formatted date string given an ISO date string.
 *
 * If the given string is not a valid ISO date string, returns the original string.
 *
 * @param {string} iso - The ISO date string to format.
 * @returns {string} The formatted date string.
 */
function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}
