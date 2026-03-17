import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { type SignInForm as SignInFormValues, signInSchema } from '@/features/auth/model/auth.forms'
import { supabase } from '@/shared/lib/supabase'
import { zodResolver } from '@/shared/lib/zodResolver'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

export function SignInForm() {
  const signIn = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSignIn(values: SignInFormValues) {
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Signed in')
  }

  return (
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
          <p className="text-sm text-red-500">{signIn.formState.errors.password.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full mt-3" disabled={signIn.formState.isSubmitting}>
        {signIn.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
