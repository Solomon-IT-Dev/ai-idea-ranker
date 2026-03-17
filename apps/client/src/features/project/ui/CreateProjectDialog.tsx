import { useForm } from 'react-hook-form'

import {
  createProjectDefaultValues,
  type CreateProjectFormValues,
  createProjectSchema,
} from '@/features/project/model/createProjectForm'
import { zodResolver } from '@/shared/lib/zodResolver'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'

type Props = {
  isPending?: boolean
  onCreate: (values: CreateProjectFormValues) => Promise<void>
}

export function CreateProjectDialog({ isPending = false, onCreate }: Props) {
  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: createProjectDefaultValues,
  })

  async function handleCreate(values: CreateProjectFormValues) {
    await onCreate(values)
    form.reset(createProjectDefaultValues)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleCreate)}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="R&D ideas Q1" {...form.register('name')} />
            {form.formState.errors.name?.message ? (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (USD)</Label>
            <Input id="budget" type="number" {...form.register('budget')} />
            {form.formState.errors.budget?.message ? (
              <p className="text-sm text-red-500">{form.formState.errors.budget.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fe">FE</Label>
              <Input id="fe" type="number" {...form.register('fe')} />
              {form.formState.errors.fe?.message ? (
                <p className="text-sm text-red-500">{form.formState.errors.fe.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="be">BE</Label>
              <Input id="be" type="number" {...form.register('be')} />
              {form.formState.errors.be?.message ? (
                <p className="text-sm text-red-500">{form.formState.errors.be.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ds">DS</Label>
              <Input id="ds" type="number" {...form.register('ds')} />
              {form.formState.errors.ds?.message ? (
                <p className="text-sm text-red-500">{form.formState.errors.ds.message}</p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting || isPending}>
              {isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
