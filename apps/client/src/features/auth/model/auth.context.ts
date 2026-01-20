import { createContext } from 'react'

import type { AuthContextValue } from '@/features/auth/model/auth.types'

export const AuthContext = createContext<AuthContextValue | null>(null)

