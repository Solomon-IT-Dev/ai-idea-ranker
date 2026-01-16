import { createRemoteJWKSet, jwtVerify } from 'jose'

import { envConfig } from '../config/env.config.js'
import { AppError } from '../lib/appError.lib.js'

import type { RequestHandler } from 'express'

const jwks = createRemoteJWKSet(new URL(`${envConfig.SUPABASE_URL}/auth/v1/.well-known/jwks.json`))

/**
 * Verifies Supabase JWT using JWKS and attaches userId to req.
 * This avoids calling Supabase Auth on every request.
 */
export const requireAuthMiddleware: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

    if (!token) {
      return next(
        new AppError({
          statusCode: 401,
          errorType: 'auth_missing_token',
          message: 'Authorization token is missing.',
        })
      )
    }

    const { payload } = await jwtVerify(token, jwks, {
      issuer: `${envConfig.SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    })

    // Supabase user id is stored in the JWT subject claim.
    req.userId = payload.sub

    if (!req.userId) {
      return next(
        new AppError({
          statusCode: 401,
          errorType: 'auth_invalid_token',
          message: 'Invalid token.',
        })
      )
    }

    next()
  } catch {
    next(
      new AppError({
        statusCode: 401,
        errorType: 'auth_invalid_token',
        message: 'Invalid or expired token.',
      })
    )
  }
}
