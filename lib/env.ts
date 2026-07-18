// =============================================================================
// FANVERSE AI — Environment Configuration
// Validates required environment variables at import time
// =============================================================================

/**
 * Retrieves a required environment variable or throws a descriptive error.
 *
 * @param key The environment variable name to look up.
 * @returns The environment variable value.
 * @throws Error if the variable is not set or is empty.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Add it to .env.local or your deployment environment.`
    );
  }
  return value;
}

/**
 * Validated environment configuration for FANVERSE AI.
 * Importing this module triggers validation — if a required variable is
 * missing, the application will fail fast with a clear error message.
 */
export const env = {
  /** Google Gemini API key for AI features */
  GEMINI_API_KEY: requireEnv('GEMINI_API_KEY'),
} as const;
