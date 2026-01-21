/**
 * Timeout duration to consider a run as "stuck" if no progress is made.
 * This is used to avoid confusing "running for hours" history entries.
 */
export const RUN_STUCK_TIMEOUT_MS = 10 * 60 * 1000
