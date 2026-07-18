// =============================================================================
// FANVERSE AI — In-Memory Rate Limiter
// Sliding-window rate limiting for API route protection
// =============================================================================

import { RATE_LIMIT_CHAT_PER_MINUTE, RATE_LIMIT_SCAN_PER_MINUTE } from './constants';

/** 
 * Sliding window entry: array of request timestamps.
 * NOTE: This rate limiter uses an in-memory Map database instance. In serverless multi-region
 * cloud deployments (such as Vercel or AWS Lambda), multiple runtime container instances
 * do not share local memory. To scale in production, replace this local Map with a shared
 * Redis backend cache (e.g. `@upstash/redis` or `ioredis`) to keep limits globally synchronized.
 */
const windows = new Map<string, number[]>();

/** Window duration in milliseconds (1 minute) */
const WINDOW_MS = 60_000;

/**
 * Result of a rate limit check.
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of remaining requests in the current window */
  remaining: number;
  /** Milliseconds until the window resets */
  retryAfterMs: number;
}

/**
 * Checks whether a given identifier (typically IP address) has exceeded
 * the rate limit for a given route.
 *
 * @param identifier Unique client identifier (e.g., IP address).
 * @param maxRequests Maximum allowed requests per window.
 * @returns RateLimitResult indicating whether the request is allowed.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  // Get or create the sliding window
  const timestamps = windows.get(key) ?? [];

  // Prune expired entries outside the window
  const validTimestamps = timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (validTimestamps.length >= maxRequests) {
    const oldestInWindow = validTimestamps[0] ?? now;
    const retryAfterMs = WINDOW_MS - (now - oldestInWindow);
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(retryAfterMs, 0),
    };
  }

  // Record the new request
  validTimestamps.push(now);
  windows.set(key, validTimestamps);

  return {
    allowed: true,
    remaining: maxRequests - validTimestamps.length,
    retryAfterMs: 0,
  };
}

/**
 * Extracts the client IP address from a Request object.
 * Falls back to 'anonymous' if no identifiable header is found.
 *
 * @param request The incoming HTTP request.
 * @returns The client IP address string.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'anonymous';
  }
  return request.headers.get('x-real-ip') ?? 'anonymous';
}

/** Pre-configured rate limit for the chat endpoint */
export const CHAT_RATE_LIMIT = RATE_LIMIT_CHAT_PER_MINUTE;

/** Pre-configured rate limit for the scan endpoint */
export const SCAN_RATE_LIMIT = RATE_LIMIT_SCAN_PER_MINUTE;
