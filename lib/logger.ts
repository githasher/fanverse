// =============================================================================
// FANVERSE AI — Structured Logger
// Environment-aware logging utility that suppresses output in production
// =============================================================================

type LogContext = string;

/**
 * Whether the current environment is development.
 * In production, log output is suppressed to avoid leaking internal details.
 */
const IS_DEV = process.env.NODE_ENV !== 'production';

/**
 * Structured logging utility for FANVERSE AI.
 * Prefixes all messages with `[FANVERSE:<context>]` for easy filtering.
 * Suppressed in production builds to prevent information leakage.
 */
export const logger = {
  /** Log an error with context label. Only outputs in development. */
  error(context: LogContext, error: unknown): void {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.error(`[FANVERSE:${context}]`, error);
    }
  },

  /** Log a warning with context label. Only outputs in development. */
  warn(context: LogContext, message: string): void {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[FANVERSE:${context}]`, message);
    }
  },

  /** Log an informational message with context label. Only outputs in development. */
  info(context: LogContext, message: string): void {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.info(`[FANVERSE:${context}]`, message);
    }
  },
} as const;
