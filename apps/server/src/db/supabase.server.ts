import { createClient } from '@supabase/supabase-js'

import { envConfig } from '../config/env.config.js'

/**
 * Admin Supabase client (Service Role).
 * Use ONLY for system tasks (maintenance, background jobs, migrations).
 * Never use for user-scoped reads/writes where RLS must be enforced.
 */
export const supabaseServer = createClient(
  envConfig.SUPABASE_URL,
  envConfig.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)
