import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { useAuth } from '@/features/auth/model/auth.hooks'
import { zodResolver } from '@/shared/lib/rhf-zod-resolver'
import { getLastProjectId } from '@/shared/lib/storage'
import { supabase } from '@/shared/lib/supabase'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

const emailSchema = z.string().email()
const passwordSchema = z.string().min(6).max(72)

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: passwordSchema,
  })
  .refine(v => v.password === v.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })

type SignInForm = z.infer<typeof signInSchema>
type SignUpForm = z.infer<typeof signUpSchema>

export function AuthPage() {
  const { isReady, accessToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }

  // If already authed, redirect away from /auth
  useEffect(() => {
    if (!isReady) return
    if (!accessToken) return

    const from = location.state?.from
    if (from) {
      navigate(from, { replace: true })
      return
    }

    const last = getLastProjectId()
    if (last) {
      navigate(`/projects/${last}`, { replace: true })
      return
    }

    navigate('/projects', { replace: true })
  }, [accessToken, isReady, location.state, navigate])

  const signIn = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  const signUp = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', passwordConfirm: '' },
  })

  async function onSignIn(values: SignInForm) {
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Signed in')
  }

  async function onSignUp(values: SignUpForm) {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Account created. Check your email if verification is enabled.')
  }

  return (
    <div className="flex min-h-dvh items-start justify-center px-6 pb-10 pt-[clamp(8rem,46vh,16rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>AI Idea Ranker</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-4">
              <form className="space-y-4" onSubmit={signIn.handleSubmit(onSignIn)}>
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" type="email" {...signIn.register('email')} />
                  {signIn.formState.errors.email?.message ? (
                    <p className="text-sm text-red-500">{signIn.formState.errors.email.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" type="password" {...signIn.register('password')} />
                  {signIn.formState.errors.password?.message ? (
                    <p className="text-sm text-red-500">
                      {signIn.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  className="w-full mt-3"
                  disabled={signIn.formState.isSubmitting}
                >
                  {signIn.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form className="space-y-4" onSubmit={signUp.handleSubmit(onSignUp)}>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" {...signUp.register('email')} />
                  {signUp.formState.errors.email?.message ? (
                    <p className="text-sm text-red-500">{signUp.formState.errors.email.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" {...signUp.register('password')} />
                  {signUp.formState.errors.password?.message ? (
                    <p className="text-sm text-red-500">
                      {signUp.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-passwordConfirm">Confirm password</Label>
                  <Input
                    id="signup-passwordConfirm"
                    type="password"
                    {...signUp.register('passwordConfirm')}
                  />
                  {signUp.formState.errors.passwordConfirm?.message ? (
                    <p className="text-sm text-red-500">
                      {signUp.formState.errors.passwordConfirm.message}
                    </p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  className="w-full mt-3"
                  disabled={signUp.formState.isSubmitting}
                >
                  {signUp.formState.isSubmitting ? 'Creating…' : 'Create account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
