import { useForm } from 'react-hook-form'

import {
  startRunDefaultValues,
  type StartRunFormValues,
  startRunSchema,
} from '@/features/run/model/startRunForm'
import { zodResolver } from '@/shared/lib/zodResolver'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

type Props = {
  isPending?: boolean
  onSubmit: (values: StartRunFormValues) => Promise<void>
}

export function StartRunForm({ isPending = false, onSubmit }: Props) {
  const form = useForm<StartRunFormValues>({
    resolver: zodResolver(startRunSchema),
    defaultValues: startRunDefaultValues,
  })

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Runs</h2>
          <p className="text-sm text-muted-foreground">
            Start a scoring run and watch live progress. Citations are based on your playbook.
          </p>
        </div>
      </div>

      <form className="mt-4 grid gap-3 md:grid-cols-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-1 md:col-span-1">
          <Label>Top N</Label>
          <Input {...form.register('topN')} />
        </div>

        <div className="space-y-1 md:col-span-1">
          <Label>Impact</Label>
          <Input {...form.register('impact')} />
        </div>

        <div className="space-y-1 md:col-span-1">
          <Label>Effort</Label>
          <Input {...form.register('effort')} />
        </div>

        <div className="space-y-1 md:col-span-1">
          <Label>Risk</Label>
          <Input {...form.register('risk')} />
        </div>

        <div className="space-y-1 md:col-span-1">
          <Label>Data readiness</Label>
          <Input {...form.register('dataReadiness')} />
        </div>

        <div className="md:col-span-1 flex items-end">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Starting…' : 'Start run'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
