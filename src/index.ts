import { apiReference } from '@scalar/hono-api-reference';
import type { Context } from 'hono';
import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { DEVELOPMENT_ORIGINS, HTTP_STATUS, ROUTES } from './constants';
import { auth } from './core/auth';
import { env } from './core/env';
import { logger } from './core/logger';
import { errorHandler } from './middleware/error-handler';
import { requireAuth, sessionMiddleware, type AppEnv } from './middleware/session';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { userRoutes } from './modules/user/user.routes';
import { postRoutes } from './modules/posts/posts.routes';
import { openApiSpec } from './openapi/spec';
import { success } from './utils/response';

export const app = new Hono<AppEnv>();

app.use('*', secureHeaders());

app.use('*', pinoLogger({ pino: logger }));

app.use('*', sessionMiddleware);

const ALLOWED_ORIGINS = {
  development: DEVELOPMENT_ORIGINS,
  production: process.env.ALLOWED_ORIGINS?.split(',') || [],
};

app.use(
  ROUTES.API.BASE + '/*',
  cors({
    origin:
      env.NODE_ENV === 'production' ? ALLOWED_ORIGINS.production : ALLOWED_ORIGINS.development,
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

app.get(ROUTES.AUTH.ME, requireAuth, (c) => {
  const user = c.get('user');
  return success(c, { user });
});

app.get(ROUTES.API.HEALTH, (c) => {
  return success(c, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Bridges Better Auth requests with standardized API response format
 *
 * @param {Context} c - Hono context
 * @returns {Promise<Response>} Standardized success response or original Better Auth response
 */
const bridgeAuthResponse = async (c: Context) => {
  const res = await auth.handler(c.req.raw);

  if (
    res.status === HTTP_STATUS.OK &&
    res.headers.get('content-type')?.includes('application/json')
  ) {
    const data = await res.json();

    res.headers.forEach((value, key) => {
      c.header(key, value);
    });

    return success(c, data);
  }

  return res;
};

app.on(['POST', 'GET'], ROUTES.AUTH.WILDCARD, bridgeAuthResponse);

app.route(ROUTES.USER.BASE, userRoutes);
app.route(ROUTES.DASHBOARD.BASE, dashboardRoutes);
app.route(ROUTES.POSTS.BASE, postRoutes);

app.get(ROUTES.ROOT, (c) => {
  return success(c, {
    message: 'Flux Stack API - Production Ready 🚀',
    version: '1.0.0',
  });
});

app.get(ROUTES.API.OPENAPI, (c) => {
  return c.json(openApiSpec);
});

app.get(
  ROUTES.API.DOCS,
  apiReference({
    url: '/openapi.json',
    theme: 'default',
  })
);

app.onError(errorHandler);

const PORT = parseInt(env.PORT);

export default {
  port: PORT,
  fetch: app.fetch,
};

console.log(`🚀 Server running on http://localhost:${PORT}`);
