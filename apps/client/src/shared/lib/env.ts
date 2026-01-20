export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
} as const

if (!env.apiBaseUrl) throw new Error('VITE_API_BASE_URL is required')
if (!env.supabaseUrl) throw new Error('VITE_SUPABASE_URL is required')
if (!env.supabaseAnonKey) throw new Error('VITE_SUPABASE_ANON_KEY is required')
