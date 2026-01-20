import { MoreHorizontalIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useDeleteIdea, useUpdateIdea } from '@/entities/idea/api/ideas.queries'
import type { Idea } from '@/entities/idea/types/idea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

type Props = {
  idea: Idea
}

export function IdeaRowActions({ idea }: Props) {
  const updateMutation = useUpdateIdea(idea.project_id)
  const deleteMutation = useDeleteIdea(idea.project_id)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [title, setTitle] = useState(idea.title)
  const [rawText, setRawText] = useState(idea.raw_text)

  function openEdit() {
    setTitle(idea.title)
    setRawText(idea.raw_text)
    setEditOpen(true)
  }

  const patch = useMemo(() => {
    const next: { title?: string; rawText?: string } = {}

    const trimmedTitle = title.trim()
    const trimmedText = rawText.trim()

    if (trimmedTitle !== idea.title) next.title = trimmedTitle
    if (trimmedText !== idea.raw_text) next.rawText = trimmedText

    return next
  }, [idea.raw_text, idea.title, rawText, title])

  const canSave =
    Boolean(title.trim()) &&
    Boolean(rawText.trim()) &&
    (patch.title !== undefined || patch.rawText !== undefined) &&
    !updateMutation.isPending

  async function onSave() {
    if (!canSave) return

    try {
      await updateMutation.mutateAsync({ ideaId: idea.id, patch })
      toast.success('Idea updated.')
      setEditOpen(false)
    } catch (e) {
      toast.error('Failed to update idea.')
      console.error(e)
    }
  }

  async function onDelete() {
    try {
      await deleteMutation.mutateAsync(idea.id)
      toast.success('Idea deleted.')
      setDeleteOpen(false)
    } catch (e) {
      toast.error('Failed to delete idea.')
      console.error(e)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Idea actions">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={openEdit}>
            <PencilIcon />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <TrashIcon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit idea</DialogTitle>
            <DialogDescription>Update title and text for this idea.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`idea-title-${idea.id}`}>Title</Label>
              <Input
                id={`idea-title-${idea.id}`}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Short title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`idea-text-${idea.id}`}>Text</Label>
              <Textarea
                id={`idea-text-${idea.id}`}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                rows={6}
                placeholder="Full idea text"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={!canSave}>
              {updateMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete idea?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The idea will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={e => {
                e.preventDefault()
                void onDelete()
              }}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
