/**
 * Centralized security-related constants for reuse across the server.
 */
export const securityConstants = {
  trustProxy: 1,
  jsonBodyLimit: '2mb',
  helmet: {
    crossOriginResourcePolicy: { policy: 'cross-origin' as const },
    crossOriginEmbedderPolicy: false,
  },
  cors: {
    credentials: true,
  },
  rateLimit: {
    limit: 300, // max requests per window per IP
    windowMs: 60 * 60 * 1000, // 1 hour
    windowMinutes: 60,
    standardHeaders: 'draft-7' as const,
    legacyHeaders: false,
  },
} as const
