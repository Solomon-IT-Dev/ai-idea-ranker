import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form'
import type { z } from 'zod'

export function zodResolver<TFieldValues extends FieldValues>(
  schema: z.ZodTypeAny
): Resolver<TFieldValues> {
  return async values => {
    const parsed = schema.safeParse(values)
    if (parsed.success) {
      return { values: parsed.data as TFieldValues, errors: {} }
    }

    const errors: FieldErrors<TFieldValues> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key !== 'string') continue
      if (errors[key as keyof FieldErrors<TFieldValues>]) continue
      ;(errors as Record<string, unknown>)[key] = { type: issue.code, message: issue.message }
    }

    return { values: {}, errors }
  }
}
