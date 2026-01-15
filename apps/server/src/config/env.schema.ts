import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),

  // Supabase
  //   SUPABASE_URL: z.url(),
  //   SUPABASE_ANON_KEY: z.string().min(1),
  //   SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // OpenAI
  //   OPENAI_API_KEY: z.string().min(1),

  // Allow client origin for stricter CORS in prod
  CLIENT_ORIGIN: z.url().optional(),
})
