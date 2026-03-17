import { MoreHorizontal } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

type Props = {
  label: string
  canCopy: boolean
  onCopy: () => void
  onExport: () => void
}

export function ArtifactActionsMenu({ label, canCopy, onCopy, onExport }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label={`${label} actions`} disabled={!canCopy}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuItem
          disabled={!canCopy}
          onSelect={event => {
            event.preventDefault()
            onCopy()
          }}
        >
          Copy
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canCopy}
          onSelect={event => {
            event.preventDefault()
            onExport()
          }}
        >
          Export
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
