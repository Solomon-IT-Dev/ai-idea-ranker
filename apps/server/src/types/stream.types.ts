import type { Response } from 'express'

export type SseClient = {
  res: Response
  keepAlive: NodeJS.Timeout
}
