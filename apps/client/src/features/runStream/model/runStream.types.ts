import type { Json } from '@/shared/types/json'

export type RunStreamEventType =
  | 'stream.open'
  | 'run.snapshot'
  | 'run.started'
  | 'run.sources_ready'
  | 'idea.scored'
  | 'plan.progress'
  | 'run.completed'
  | 'run.failed'

export type RunStreamEvent =
  | { type: RunStreamEventType; data: Json | string }
  | { type: 'unknown'; data: Json | string; eventName?: string }
