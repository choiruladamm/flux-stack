import { MINUTES_TO_MS } from './time';

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT = {
  WINDOW_SECONDS: 60,
  MAX_REQUESTS_PRODUCTION: 100,
  MAX_REQUESTS_DEVELOPMENT: 50,
} as const;

/**
 * Brute force protection configuration
 */
export const BRUTE_FORCE = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * MINUTES_TO_MS,
  RESET_DURATION_MS: 5 * MINUTES_TO_MS,
} as const;

/**
 * Password requirements
 */
export const PASSWORD = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
} as const;
/**
 * Error codes
 */
export const ERROR_CODES = {
  // Auth errors
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  PASSWORD_COMPROMISED: 'PASSWORD_COMPROMISED',

  // Server errors
  INTERNAL_SERVER: 'INTERNAL_SERVER_ERROR',
  HTTP_ERROR: 'HTTP_ERROR',
  NOT_FOUND: 'NOT_FOUND',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;
