import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(2).max(80),
  budget: z.coerce.number().int().min(0).max(10_000_000),
  fe: z.coerce.number().int().min(0).max(50),
  be: z.coerce.number().int().min(0).max(50),
  ds: z.coerce.number().int().min(0).max(50).optional(),
})

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>

export const createProjectDefaultValues: CreateProjectFormValues = {
  name: '',
  budget: 10_000,
  fe: 1,
  be: 1,
  ds: 0,
}

export function mapCreateProjectFormToPayload(values: CreateProjectFormValues) {
  return {
    name: values.name,
    constraints: {
      budget: values.budget,
      team: {
        fe: values.fe,
        be: values.be,
        ...(values.ds ? { ds: values.ds } : {}),
      },
    },
  }
}
