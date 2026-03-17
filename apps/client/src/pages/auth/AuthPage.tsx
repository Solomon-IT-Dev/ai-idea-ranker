import { useAuthRedirect } from '@/features/auth/model/auth.hooks'
import { SignInForm } from '@/features/auth/ui/SignInForm'
import { SignUpForm } from '@/features/auth/ui/SignUpForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

export function AuthPage() {
  useAuthRedirect()

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
              <SignInForm />
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
