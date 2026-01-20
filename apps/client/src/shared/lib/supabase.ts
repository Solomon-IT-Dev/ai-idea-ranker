import { createClient } from '@supabase/supabase-js'

import { env } from '@/shared/lib/env'

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
