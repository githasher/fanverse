// =============================================================================
// FANVERSE AI — API Input Validation & Sanitization
// Guards API route inputs against malformed, oversized, or malicious payloads
// =============================================================================

import sanitizeHtml from 'sanitize-html';
import type { StadiumState, UserProfile } from '@/types';
import {
  MAX_MESSAGE_LENGTH,
  MAX_IMAGE_BASE64_LENGTH,
  SUPPORTED_IMAGE_TYPES,
  CHAT_HISTORY_WINDOW,
} from './constants';

/** Result of a validation check */
export interface ValidationResult {
  /** Whether the input passed all checks */
  isValid: boolean;
  /** Human-readable error description (present only if isValid is false) */
  error?: string;
}

/**
 * Strips potentially dangerous HTML/script tags from user input to mitigate XSS.
 * Preserves plain text and safe markdown formatting.
 *
 * @param input The raw user input string.
 * @returns Sanitized string with HTML tags removed.
 */
export function sanitizeInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

/**
 * Validates the request payload for the AI chat route.
 * Rejects messages exceeding size limits, missing parameters, or invalid schemas.
 *
 * @param message The user's chat message.
 * @param stadiumState The current stadium state object.
 * @param userProfile The user profile object.
 * @returns ValidationResult indicating pass/fail with error description.
 */
export function validateChatRequest(
  message: unknown,
  stadiumState: unknown,
  userProfile: unknown
): ValidationResult {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Parameter "message" is required and must be a string.' };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { isValid: false, error: `Message exceeds the maximum length of ${MAX_MESSAGE_LENGTH} characters.` };
  }

  if (!stadiumState || typeof stadiumState !== 'object') {
    return { isValid: false, error: 'Parameter "stadiumState" is required and must be an object.' };
  }

  if (!userProfile || typeof userProfile !== 'object') {
    return { isValid: false, error: 'Parameter "userProfile" is required and must be an object.' };
  }

  // Structural schema checks on the stadium state
  const state = stadiumState as StadiumState;
  if (!Array.isArray(state.gates) || !Array.isArray(state.facilities) || !Array.isArray(state.zones)) {
    return { isValid: false, error: 'Invalid "stadiumState" schema: gates, facilities, and zones must be arrays.' };
  }

  // Structural schema checks on the user profile
  const profile = userProfile as UserProfile;
  if (typeof profile.name !== 'string' || typeof profile.language !== 'string') {
    return { isValid: false, error: 'Invalid "userProfile" schema: name and language must be strings.' };
  }

  return { isValid: true };
}

/**
 * Validates the chat history array from the request payload.
 * Enforces a maximum window size and basic item shape.
 *
 * @param history The chat history array from the request body.
 * @returns ValidationResult indicating pass/fail.
 */
export function validateChatHistory(
  history: unknown
): ValidationResult {
  if (history === undefined || history === null) {
    return { isValid: true }; // History is optional
  }

  if (!Array.isArray(history)) {
    return { isValid: false, error: 'Parameter "history" must be an array.' };
  }

  if (history.length > CHAT_HISTORY_WINDOW * 2) {
    return { isValid: false, error: `Chat history exceeds maximum of ${CHAT_HISTORY_WINDOW * 2} messages.` };
  }

  for (const item of history) {
    if (typeof item !== 'object' || item === null) {
      return { isValid: false, error: 'Each history item must be an object.' };
    }
  }

  return { isValid: true };
}

/**
 * Validates the request payload for the ticket scanner OCR route.
 * Rejects images exceeding size limits, unsupported formats, or missing parameters.
 *
 * @param imageBase64 The base64-encoded ticket image string.
 * @returns ValidationResult indicating pass/fail with error description.
 */
export function validateScanRequest(imageBase64: unknown): ValidationResult {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { isValid: false, error: 'Parameter "imageBase64" is required and must be a string.' };
  }

  if (imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
    return { isValid: false, error: 'Image file size exceeds the 5MB limit.' };
  }

  if (!imageBase64.startsWith('data:image/')) {
    return { isValid: false, error: 'Invalid image format. Must be a base64 data URI.' };
  }

  // Validate MIME type against allowlist
  const mimeMatch = imageBase64.match(/^data:(image\/[a-z]+);base64,/);
  if (!mimeMatch) {
    return { isValid: false, error: 'Malformed base64 data URI.' };
  }

  const mimeType = mimeMatch[1];
  if (!SUPPORTED_IMAGE_TYPES.includes(mimeType as typeof SUPPORTED_IMAGE_TYPES[number])) {
    return { isValid: false, error: `Unsupported image type: ${mimeType}. Supported: ${SUPPORTED_IMAGE_TYPES.join(', ')}.` };
  }

  return { isValid: true };
}
