import { useEffect, useMemo, useState } from 'react'

import { AuthContext } from '@/features/auth/model/auth.context'
import type { AuthContextValue } from '@/features/auth/model/auth.types'
import { setTokenProvider } from '@/shared/api/token'
import { supabase } from '@/shared/lib/supabase'

import type { Session } from '@supabase/supabase-js'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setTokenProvider(() => session?.access_token ?? null)
    return () => setTokenProvider(() => null)
  }, [session])

  useEffect(() => {
    let isMounted = true

    void (async () => {
      const { data } = await supabase.auth.getSession()
      if (!isMounted) return
      setSession(data.session ?? null)
      setIsReady(true)
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsReady(true)
    })
    return () => {
      isMounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    return {
      isReady,
      session,
      user: session?.user ?? null,
      accessToken: session?.access_token ?? null,
      signOut: async () => {
        await supabase.auth.signOut()
      },
    }
  }, [isReady, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
