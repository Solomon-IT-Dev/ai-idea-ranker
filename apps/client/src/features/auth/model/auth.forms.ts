import { z } from 'zod'

const emailSchema = z.string().email()
const passwordSchema = z.string().min(6).max(72)

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: passwordSchema,
  })
  .refine(v => v.password === v.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })

export type SignInForm = z.infer<typeof signInSchema>
export type SignUpForm = z.infer<typeof signUpSchema>

