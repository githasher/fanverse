// =============================================================================
// FANVERSE AI — Application Constants
// Single source of truth for all configuration values and magic numbers
// =============================================================================

// -----------------------------------------------------------------------------
// AI Model Configuration
// -----------------------------------------------------------------------------

/** Gemini model identifier */
export const MODEL_ID = 'gemini-3.5-flash' as const;

/** Temperature for Gemini responses (0-2). Higher = more creative. */
export const AI_TEMPERATURE = 0.8;

/** Top-P sampling parameter for nucleus sampling */
export const AI_TOP_P = 0.95;

/** Top-K sampling parameter */
export const AI_TOP_K = 40;

/** Maximum tokens in Gemini response */
export const AI_MAX_OUTPUT_TOKENS = 1024;

// -----------------------------------------------------------------------------
// Validation Limits
// -----------------------------------------------------------------------------

/** Maximum character length for user chat messages */
export const MAX_MESSAGE_LENGTH = 2_000;

/** Maximum base64 string length for ticket images (~5MB) */
export const MAX_IMAGE_BASE64_LENGTH = 7_000_000;

/** Allowed MIME types for ticket image uploads */
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

// -----------------------------------------------------------------------------
// Stadium Configuration
// -----------------------------------------------------------------------------

/** MetLife Stadium maximum seating capacity */
export const STADIUM_CAPACITY = 82_500;

/** Number of chat history messages sent to Gemini for context */
export const CHAT_HISTORY_WINDOW = 6;

/** Maximum stored notifications before oldest are pruned */
export const MAX_NOTIFICATIONS = 50;

// -----------------------------------------------------------------------------
// Simulation Configuration
// -----------------------------------------------------------------------------

/** Simulation tick interval in milliseconds */
export const TICK_INTERVAL_MS = 3_000;

/** Default PRNG seed for reproducible simulation */
export const DEFAULT_SIMULATION_SEED = 2026;

// -----------------------------------------------------------------------------
// Rate Limiting
// -----------------------------------------------------------------------------

/** Maximum chat API requests per IP per minute */
export const RATE_LIMIT_CHAT_PER_MINUTE = 20;

/** Maximum scan API requests per IP per minute */
export const RATE_LIMIT_SCAN_PER_MINUTE = 10;

// -----------------------------------------------------------------------------
// UI Thresholds
// -----------------------------------------------------------------------------

/** Facility wait (minutes) below which we consider it 'short' */
export const SHORT_QUEUE_THRESHOLD_MINUTES = 3;

/** Number of top zones to show in context summary */
export const CONTEXT_SUMMARY_TOP_ZONES = 5;

/** Number of top facilities to show in context summary */
export const CONTEXT_SUMMARY_TOP_FACILITIES = 8;

/** Number of top food vendors to show in context summary */
export const CONTEXT_SUMMARY_TOP_FOOD = 8;

/** Queue card sensory color threshold (minutes) */
export const QUEUE_SENSORY_THRESHOLD = 12;

/** Queue progress bar maximum denominator */
export const QUEUE_PROGRESS_MAX = 30;

// -----------------------------------------------------------------------------
// Design Tokens
// -----------------------------------------------------------------------------

/** Primary dark background color */
export const COLOR_BG_PRIMARY = '#0A0E27' as const;

/** Primary accent color (cyan) */
export const COLOR_ACCENT_CYAN = '#00F5FF' as const;

/** Secondary accent color (gold) */
export const COLOR_ACCENT_GOLD = '#FFD700' as const;

/** Success color (emerald) */
export const COLOR_SUCCESS = '#10B981' as const;

/** Danger color (red) */
export const COLOR_DANGER = '#EF4444' as const;
