import type { IdeaScoreRow } from '@/entities/run/types/run'
import { Card } from '@/shared/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export function RunScoresTableCard({ scores }: { scores: IdeaScoreRow[] }) {
  return (
    <Card className="p-4">
      <h3 className="text-base font-semibold">Top results</h3>

      <div className="mt-3 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Idea</TableHead>
              <TableHead>Overall</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Effort</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map(score => (
              <TableRow key={score.id}>
                <TableCell className="min-w-[260px]">
                  <div className="font-medium">{score.ideas?.title ?? score.idea_id}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{score.rationale}</div>
                </TableCell>
                <TableCell>{Math.round(score.overall)}</TableCell>
                <TableCell>{score.impact}</TableCell>
                <TableCell>{score.effort}</TableCell>
                <TableCell>{score.risk}</TableCell>
                <TableCell>{score.data_readiness}</TableCell>
              </TableRow>
            ))}

            {scores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No scores yet. If the run is running, they will appear after completion.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
