/**
 * API Input Validation Utilities for FANVERSE AI
 */

import type { StadiumState, UserProfile } from '@/types';

/**
 * Validates request payload for the AI chat route.
 * Rejects messages exceeding size limits or missing parameters.
 */
export function validateChatRequest(
  message: unknown,
  stadiumState: unknown,
  userProfile: unknown
): { isValid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Parameter "message" is required and must be a string.' };
  }

  if (message.length > 2000) {
    return { isValid: false, error: 'Message exceeds the maximum length of 2000 characters.' };
  }

  if (!stadiumState || typeof stadiumState !== 'object') {
    return { isValid: false, error: 'Parameter "stadiumState" is required and must be an object.' };
  }

  if (!userProfile || typeof userProfile !== 'object') {
    return { isValid: false, error: 'Parameter "userProfile" is required and must be an object.' };
  }

  // Basic object structure check
  const state = stadiumState as StadiumState;
  if (!Array.isArray(state.gates) || !Array.isArray(state.facilities) || !Array.isArray(state.zones)) {
    return { isValid: false, error: 'Invalid "stadiumState" schema.' };
  }

  const profile = userProfile as UserProfile;
  if (typeof profile.name !== 'string' || typeof profile.language !== 'string') {
    return { isValid: false, error: 'Invalid "userProfile" schema.' };
  }

  return { isValid: true };
}

/**
 * Validates request payload for the ticket scanner OCR route.
 * Rejects images exceeding size limits or missing parameters.
 */
export function validateScanRequest(imageBase64: unknown): { isValid: boolean; error?: string } {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { isValid: false, error: 'Parameter "imageBase64" is required and must be a string.' };
  }

  // Reject extremely large base64 image strings (5MB limit: approx 6.67M base64 characters)
  if (imageBase64.length > 7000000) {
    return { isValid: false, error: 'Image file size exceeds the 5MB limit.' };
  }

  if (!imageBase64.startsWith('data:image/')) {
    return { isValid: false, error: 'Invalid image format. Must be a base64 data URI.' };
  }

  return { isValid: true };
}
