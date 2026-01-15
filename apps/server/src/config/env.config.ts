import { z } from 'zod'

import { envSchema } from './env.schema.js'

/**
 * Centralized environment configuration.
 * - Validates required variables at startup.
 * - Provides typed access to env across the codebase.
 * - Keeps secrets out of source control (use .env locally, platform vars in prod).
 */

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  // Keep this as console output because logger may rely on env.
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', z.treeifyError(parsed.error))
  process.exit(1)
}

export const envConfig = parsed.data
