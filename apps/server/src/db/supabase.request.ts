import { createClient } from '@supabase/supabase-js'

import { envConfig } from '../config/env.config.js'

import type { Request } from 'express'

/**
 * Creates a Supabase client bound to the current user's JWT.
 * This makes Postgres RLS policies enforceable via auth.uid().
 */
export function createSupabaseForRequest(req: Request) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

  return createClient(envConfig.SUPABASE_URL, envConfig.SUPABASE_ANON_KEY, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
