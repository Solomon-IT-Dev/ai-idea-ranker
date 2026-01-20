import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/features/auth/model/auth.provider'

import { AppQueryProvider } from './query.provider'

function ErrorFallback() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Please refresh the page. If the problem persists, check the console logs.
      </p>
    </div>
  )
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AppQueryProvider>
        <AuthProvider>
          {children}
          <Toaster richColors />
        </AuthProvider>
      </AppQueryProvider>
    </ErrorBoundary>
  )
}
