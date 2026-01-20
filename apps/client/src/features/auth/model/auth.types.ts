import type { Session, User } from '@supabase/supabase-js'

export type AuthState = {
  isReady: boolean
  session: Session | null
  user: User | null
  accessToken: string | null
}

export type AuthContextValue = AuthState & {
  signOut: () => Promise<void>
}
