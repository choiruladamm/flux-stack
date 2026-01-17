/**
 * API route constants - Single source of truth
 */
export const ROUTES = {
  ROOT: '/',
  API: {
    BASE: '/api',
    HEALTH: '/api/health',
    OPENAPI: '/openapi.json',
    DOCS: '/docs',
  },
  AUTH: {
    BASE: '/api/auth',
    WILDCARD: '/api/auth/*',
    SIGN_UP: '/api/auth/sign-up/email',
    SIGN_IN: '/api/auth/sign-in/email',
    SIGN_OUT: '/api/auth/sign-out',
    ME: '/api/auth/me',
  },
  USER: {
    BASE: '/api/user',
    PROFILE: '/api/user/profile',
    ACCOUNT: '/api/user/account',
  },
  DASHBOARD: {
    BASE: '/api/dashboard',
    STATS: '/api/dashboard/stats',
    ACTIVITY: '/api/dashboard/activity',
    OVERVIEW: '/api/dashboard/overview',
  },
  POSTS: {
    BASE: '/api/posts',
    DETAIL: '/api/posts/:id',
  },
} as const;

/**
 * Helper to build API routes
 */
export const buildRoute = (...parts: string[]): string => {
  return parts.join('');
};
