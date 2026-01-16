import { DEV_URLS } from './defaults';

/**
 * Session configuration
 */
export const SESSION = {
  EXPIRES_DAYS: 7,
  UPDATE_AGE_DAYS: 1,
  COOKIE_NAME: 'better-auth.session_token',
} as const;

/**
 * CORS allowed origins for development
 */
export const DEVELOPMENT_ORIGINS: string[] = [
  DEV_URLS.LOCALHOST,
  DEV_URLS.LOCALHOST_ALT_PORT,
  DEV_URLS.IPV4_LOCALHOST,
];
