import { env } from '../core/env';
import { healthPath } from './paths/health';
import { authPaths } from './paths/auth';
import { userPaths, dashboardPaths } from './paths/protected';
import { postPaths } from './paths/posts';

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Flux Stack API',
    version: '1.0.0',
    description: 'Production-ready SaaS backend with Hono, Drizzle, Bun, and Better Auth',
  },
  servers: [
    {
      url: `http://localhost:${env.PORT || 3000}`,
      description: 'Development server',
    },
  ],
  paths: {
    ...healthPath,
    ...authPaths,
    ...userPaths,
    ...dashboardPaths,
    ...postPaths,
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'better-auth.session_token',
      },
    },
  },
};
