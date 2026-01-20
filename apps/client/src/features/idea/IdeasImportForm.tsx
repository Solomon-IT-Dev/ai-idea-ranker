import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { normalizeIdeasInput } from '@/shared/lib/ideasImport'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Textarea } from '@/shared/ui/textarea'

type FormValues = {
  text: string
}

type Props = {
  onImport: (text: string) => void
  isPending?: boolean
}

export function IdeasImportForm({ onImport, isPending }: Props) {
  const { register, watch, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { text: '' },
  })

  const text = watch('text')

  const preview = useMemo(() => normalizeIdeasInput(text), [text])

  function submit(values: FormValues) {
    onImport(values.text)
    reset({ text: '' })
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">Import ideas</h3>
          <p className="text-sm text-muted-foreground">
            Paste a bullet list, numbered list, or one idea per line.
          </p>
        </div>

        <Textarea
          placeholder={`- Build an LLM-assisted intake form
- Add RAG over playbook
- Auto-generate 30-60-90 plan`}
          rows={7}
          {...register('text')}
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Parsed: <span className="font-medium text-foreground">{preview.length}</span>
          </p>

          <Button onClick={handleSubmit(submit)} disabled={isPending || preview.length === 0}>
            {isPending ? 'Importing…' : 'Import'}
          </Button>
        </div>

        {preview.length > 0 && (
          <div className="rounded-md border p-3">
            <p className="text-sm font-medium">Preview</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {preview.slice(0, 10).map((x, idx) => (
                <li key={`${x}-${idx}`}>{x}</li>
              ))}
              {preview.length > 10 && (
                <li className="text-muted-foreground">…and {preview.length - 10} more</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </Card>
  )
}
