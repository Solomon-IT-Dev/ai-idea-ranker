import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'

import type { GetPlaybookResponse } from '@/entities/playbook/types/playbook'
import { getPlaybookEditorMode, setPlaybookEditorMode } from '@/shared/lib/storage'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Textarea } from '@/shared/ui/textarea'

type FormValues = {
  title: string
  content: string
}

type Props = {
  projectId: string
  initial?: GetPlaybookResponse | null
  onSave: (values: FormValues) => Promise<void>
  isPending?: boolean
}

export function PlaybookEditor({ projectId, initial, onSave, isPending }: Props) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      title: initial?.playbook?.title ?? 'R&D Playbook',
      content: initial?.playbook?.content_markdown ?? '',
    },
  })
  const content = watch('content')

  const [mode, setMode] = useState<'edit' | 'preview'>(() => {
    const stored = getPlaybookEditorMode(projectId)
    if (stored) return stored
    const initialContent = initial?.playbook?.content_markdown ?? ''
    return initialContent.trim() ? 'preview' : 'edit'
  })
  const didAutoDefault = useRef(false)

  // Initial data arrives asynchronously; keep form in sync with saved server state.
  useEffect(() => {
    reset({
      title: initial?.playbook?.title ?? 'R&D Playbook',
      content: initial?.playbook?.content_markdown ?? '',
    })
  }, [
    initial?.playbook?.content_markdown,
    initial?.playbook?.id,
    initial?.playbook?.title,
    initial?.playbook?.updated_at,
    reset,
  ])

  // Default to Preview when there is content (unless user has a saved preference).
  useEffect(() => {
    if (didAutoDefault.current) return
    const stored = getPlaybookEditorMode(projectId)
    if (stored) {
      setMode(stored)
      didAutoDefault.current = true
      return
    }
    const initialContent = initial?.playbook?.content_markdown ?? ''
    if (initialContent.trim()) {
      setMode('preview')
    }
    didAutoDefault.current = true
  }, [initial?.playbook?.content_markdown, projectId])

  async function submit(values: FormValues) {
    try {
      await onSave(values)
      toast.success('Playbook uploaded.')
      reset(values)
    } catch (e) {
      toast.error('Failed to upload playbook.')

      console.error(e)
    }
  }

  const hasPlaybook = Boolean(initial?.playbook?.id)
  const canResetFromServer = Boolean(initial?.playbook?.id)

  function buildChunkText() {
    if (!initial?.chunks?.length) return ''
    return initial.chunks
      .slice()
      .sort((a, b) => a.chunk_index - b.chunk_index)
      .map(c => c.chunk_text)
      .join('\n\n')
  }

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

        <Tabs
          value={mode}
          onValueChange={v => {
            const next = v === 'preview' ? 'preview' : 'edit'
            setMode(next)
            setPlaybookEditorMode(projectId, next)
          }}
        >
          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Markdown</p>
              <p className="text-xs text-muted-foreground">Switch to Preview to verify formatting.</p>
            </div>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="edit" className="mt-2">
            <Textarea
              rows={10}
              placeholder={`# Prioritization best practices

- Define measurable success metrics upfront.
- Ensure dataset access and quality.
- Start with the smallest experiment that can falsify the hypothesis.
`}
              {...register('content')}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-2">
            {content?.trim() ? (
              <div className="rounded-md border p-3">
                <article className="prose prose-zinc max-w-none dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="mt-0 scroll-m-20 text-xl font-semibold tracking-tight">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <div className="mt-6 mb-3 border-l-2 border-primary/40 pl-3">
                          <h2 className="m-0 scroll-m-20 text-base font-semibold tracking-tight">
                            {children}
                          </h2>
                        </div>
                      ),
                      h3: ({ children }) => (
                        <h3 className="mt-5 scroll-m-20 text-sm font-semibold tracking-tight">
                          {children}
                        </h3>
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </article>
              </div>
            ) : (
              <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                Nothing to preview yet. Add some markdown in Edit.
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Uploading will replace the current playbook chunks for this project.
            </p>
            {canResetFromServer && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const next =
                    initial?.playbook?.content_markdown?.trim()
                      ? initial.playbook.content_markdown
                      : buildChunkText()
                  setValue('content', next)
                }}
              >
                Reset from server
              </Button>
            )}
          </div>

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
