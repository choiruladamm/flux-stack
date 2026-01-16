import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { pinoLogger } from 'hono-pino';
import { secureHeaders } from 'hono/secure-headers';
import { apiReference } from '@scalar/hono-api-reference';
import { logger } from './core/logger';
import { env } from './core/env';
import { auth } from './core/auth';
import { errorHandler } from './middleware/error-handler';
import { sessionMiddleware, requireAuth, type AppEnv } from './middleware/session';
import { openApiSpec } from './openapi/spec';
import { userRoutes } from './modules/user/user.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { ROUTES, DEVELOPMENT_ORIGINS } from './constants';
import { success } from './utils/response';

const app = new Hono<AppEnv>();

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

app.on(['POST', 'GET'], ROUTES.AUTH.WILDCARD, (c) => {
  return auth.handler(c.req.raw);
});

app.route(ROUTES.USER.BASE, userRoutes);
app.route(ROUTES.DASHBOARD.BASE, dashboardRoutes);

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
