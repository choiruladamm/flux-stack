import type { Context } from 'hono';
import { auth } from '../core/auth';
import { AppError } from './error-handler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/http-status';

export type AppEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
    validatedData: Record<string, unknown>;
  };
};

/**
 * Extracts session from request and populates Hono context variables
 */
export const sessionMiddleware = async (c: Context, next: () => Promise<void>) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    c.set('user', null);
    c.set('session', null);
    return next();
  }

  c.set('user', session.user);
  c.set('session', session.session);
  return next();
};

/**
 * Requires authenticated user session
 * @throws AppError(401) if no session found
 */
export const requireAuth = async (c: Context, next: () => Promise<void>) => {
  const session = c.get('session');

  if (!session) {
    throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }

  return next();
};
