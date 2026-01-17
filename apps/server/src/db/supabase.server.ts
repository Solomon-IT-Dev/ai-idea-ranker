import { createClient } from '@supabase/supabase-js'

import { envConfig } from '../config/env.config.js'

/**
 * Server-side Supabase client using Service Role key.
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
