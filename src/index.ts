import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { pinoLogger } from 'hono-pino';
import { logger } from './core/logger';
import { env } from './core/env';
import { auth } from './core/auth';
import { errorHandler } from './middleware/error-handler';
import { sessionMiddleware, requireAuth, type AppEnv } from './middleware/session';

const app = new Hono<AppEnv>();

app.use('*', pinoLogger({ pino: logger }));

app.use('*', sessionMiddleware);

app.use(
  '/api/auth/*',
  cors({
    origin: env.NODE_ENV === 'development' ? '*' : process.env.ALLOWED_ORIGINS?.split(',') || [],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    credentials: true,
  })
);

app.get('/api/auth/me', requireAuth, (c) => {
  const user = c.get('user');
  return c.json({ user });
});

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

app.get('/', (c) => {
  return c.text('Flux Stack API - Production Ready 🚀');
});

app.onError(errorHandler);

const PORT = parseInt(env.PORT);

export default {
  port: PORT,
  fetch: app.fetch,
};

console.log(`🚀 Server running on http://localhost:${PORT}`);
