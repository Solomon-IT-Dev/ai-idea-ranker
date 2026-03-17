import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { type SignUpForm as SignUpFormValues, signUpSchema } from '@/features/auth/model/auth.forms'
import { supabase } from '@/shared/lib/supabase'
import { zodResolver } from '@/shared/lib/zodResolver'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

export function SignUpForm() {
  const signUp = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', passwordConfirm: '' },
  })

  async function onSignUp(values: SignUpFormValues) {
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
          <p className="text-sm text-red-500">{signUp.formState.errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-passwordConfirm">Confirm password</Label>
        <Input id="signup-passwordConfirm" type="password" {...signUp.register('passwordConfirm')} />
        {signUp.formState.errors.passwordConfirm?.message ? (
          <p className="text-sm text-red-500">{signUp.formState.errors.passwordConfirm.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full mt-3" disabled={signUp.formState.isSubmitting}>
        {signUp.formState.isSubmitting ? 'Creating…' : 'Create account'}
      </Button>
    </form>
  )
}
