/* eslint-disable @typescript-eslint/no-explicit-any */
export type RunStreamEvent =
  | { type: 'stream.open'; data: any }
  | { type: 'run.snapshot'; data: any }
  | { type: 'run.started'; data: any }
  | { type: 'run.sources_ready'; data: any }
  | { type: 'idea.scored'; data: any }
  | { type: 'plan.progress'; data: any }
  | { type: 'run.completed'; data: any }
  | { type: 'run.failed'; data: any }
  | { type: 'unknown'; data: any; eventName?: string }
