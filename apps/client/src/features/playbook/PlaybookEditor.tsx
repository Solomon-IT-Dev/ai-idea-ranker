import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { GetPlaybookResponse } from '@/entities/playbook/types/playbook'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

type FormValues = {
  title: string
  content: string
}

type Props = {
  initial?: GetPlaybookResponse | null
  onSave: (values: FormValues) => Promise<void>
  isPending?: boolean
}

export function PlaybookEditor({ initial, onSave, isPending }: Props) {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      title: initial?.playbook?.title ?? 'R&D Playbook',
      content: '',
    },
  })

  // If playbook exists, we don't auto-fill markdown (server stores chunks, not raw markdown)
  // We keep UX simple: user paste markdown and overwrite / re-upload.
  useEffect(() => {
    reset({
      title: initial?.playbook?.title ?? 'R&D Playbook',
      content: '',
    })
  }, [initial?.playbook?.id, initial?.playbook?.title, reset])

  async function submit(values: FormValues) {
    try {
      await onSave(values)
      toast.success('Playbook uploaded.')
      reset({ ...values, content: '' })
    } catch (e) {
      toast.error('Failed to upload playbook.')

      console.error(e)
    }
  }

  const hasPlaybook = Boolean(initial?.playbook?.id)

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">Playbook</h3>
          <p className="text-sm text-muted-foreground">
            Upload a short best-practices playbook (markdown). The server will chunk + embed it for
            citations.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">Title</p>
            <Input placeholder="Playbook title" {...register('title')} />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Status</p>
            <div className="rounded-md border p-3 text-sm">
              {hasPlaybook ? (
                <div className="space-y-1">
                  <div>
                    <span className="text-muted-foreground">Chunks:</span>{' '}
                    <span className="font-medium">{initial?.chunks.length ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Updated:</span>{' '}
                    <span className="font-medium">
                      {formatDate(
                        initial?.playbook?.updated_at ?? initial?.playbook?.created_at ?? ''
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">No playbook uploaded yet.</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">Markdown</p>
          <Textarea
            rows={10}
            placeholder={`# Prioritization best practices

- Define measurable success metrics upfront.
- Ensure dataset access and quality.
- Start with the smallest experiment that can falsify the hypothesis.
`}
            {...register('content')}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Uploading will replace the current playbook chunks for this project.
          </p>

          <Button onClick={handleSubmit(submit)} disabled={isPending}>
            {isPending ? 'Uploading…' : hasPlaybook ? 'Re-upload' : 'Upload'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}
