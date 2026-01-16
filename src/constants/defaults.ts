/**
 * Default server configuration
 */
export const SERVER = {
  DEFAULT_PORT: 3000,
  FRONTEND_DEV_PORT: 3001,
} as const;

/**
 * Default URLs for development
 */
export const DEV_URLS = {
  LOCALHOST: 'http://localhost:3000',
  LOCALHOST_ALT_PORT: 'http://localhost:3001',
  IPV4_LOCALHOST: 'http://127.0.0.1:3000',
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * Common string lengths
 */
export const STRING_LIMITS = {
  EMAIL_MAX: 255,
  NAME_MAX: 100,
  DESCRIPTION_MAX: 500,
  TEXT_SHORT: 50,
  TEXT_MEDIUM: 255,
  TEXT_LONG: 1000,
} as const;
