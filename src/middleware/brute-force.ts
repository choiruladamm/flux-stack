import type { Context } from 'hono';
import { logger } from '../core/logger';
import { BRUTE_FORCE, ERROR_CODES, HTTP_STATUS, SECONDS_TO_MS } from '../constants';
import { error } from '../utils/response';

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const attempts = new Map<string, LoginAttempt>();

const MAX_ATTEMPTS = BRUTE_FORCE.MAX_ATTEMPTS;
const LOCKOUT_DURATION = BRUTE_FORCE.LOCKOUT_DURATION_MS;
const RESET_DURATION = BRUTE_FORCE.RESET_DURATION_MS;

/**
 * Track and limit failed login attempts to prevent brute force attacks
 *
 * @param c - Hono context
 * @param next - Next middleware
 */
export const bruteForceProtection = async (c: Context, next: () => Promise<void>) => {
  const body = await c.req.json();
  const identifier = body.email || c.req.header('x-forwarded-for') || 'unknown';

  const attempt = attempts.get(identifier);
  const now = Date.now();

  if (attempt) {
    if (attempt.lockedUntil && now < attempt.lockedUntil) {
      const remainingSeconds = Math.ceil((attempt.lockedUntil - now) / SECONDS_TO_MS);
      logger.warn({ identifier, remainingSeconds }, 'Account locked due to brute force attempts');

      return error(
        c,
        ERROR_CODES.ACCOUNT_LOCKED,
        `Too many failed attempts. Try again in ${remainingSeconds} seconds.`,
        HTTP_STATUS.TOO_MANY_REQUESTS
      );
    }

    if (now - attempt.firstAttempt > RESET_DURATION) {
      attempts.delete(identifier);
    }
  }

  return next();
};

/**
 * Record failed login attempt
 *
 * @param identifier - User email or IP address
 */
export const recordFailedAttempt = (identifier: string): void => {
  const attempt = attempts.get(identifier) || {
    count: 0,
    firstAttempt: Date.now(),
  };

  attempt.count++;

  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = Date.now() + LOCKOUT_DURATION;
    logger.warn({ identifier, attempts: attempt.count }, 'Account locked after max attempts');
  }

  attempts.set(identifier, attempt);
};

/**
 * Clear failed attempts on successful login
 *
 * @param identifier - User email or IP address
 */
export const clearAttempts = (identifier: string): void => {
  attempts.delete(identifier);
  logger.info({ identifier }, 'Login attempts cleared');
};

/**
 * Get current attempt count for identifier
 *
 * @param identifier - User email or IP address
 * @returns Current attempt count
 */
export const getAttemptCount = (identifier: string): number => {
  return attempts.get(identifier)?.count || 0;
};
