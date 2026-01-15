import pino from 'pino'
import { pinoHttp } from 'pino-http'

import { envConfig } from '../config/env.config.js'

export const logger = pino({
  level: envConfig.NODE_ENV === 'production' ? 'info' : 'debug',
})

export const loggerHttp = pinoHttp({ logger })
