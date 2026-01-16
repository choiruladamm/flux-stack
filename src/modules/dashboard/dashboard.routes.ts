import { Hono } from 'hono';
import { requireAuth, type AppEnv } from '../../middleware/session';
import { success } from '../../utils/response';
import { validate } from '../../middleware/validate';
import { paginationSchema, type PaginationInput } from './dashboard.schema';

export const dashboardRoutes = new Hono<AppEnv>();

/**
 * Get dashboard statistics
 */
dashboardRoutes.get('/stats', requireAuth, validate(paginationSchema, 'query'), async (c) => {
  const user = c.get('user')!;
  const { page, limit } = c.get('validatedData') as PaginationInput;

  return success(c, {
    userId: user.id,
    stats: {
      totalPosts: 10,
      totalViews: 1000,
      totalComments: 50,
    },
    pagination: {
      page,
      limit,
      total: 1, // Mock total
      totalPages: 1,
    },
    lastActivity: new Date().toISOString(),
  });
});

/**
 * Get user activity feed
 */
dashboardRoutes.get('/activity', requireAuth, validate(paginationSchema, 'query'), async (c) => {
  const user = c.get('user')!;
  const { page, limit } = c.get('validatedData') as PaginationInput;

  return success(c, {
    userId: user.id,
    activities: [
      {
        type: 'login',
        timestamp: new Date().toISOString(),
        details: 'User logged in',
      },
      {
        type: 'profile_updated',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        details: 'Profile information updated',
      },
    ],
    pagination: {
      page,
      limit,
      total: 2, // Mock total
      totalPages: 1,
    },
  });
});

/**
 * Get dashboard overview
 */
dashboardRoutes.get('/overview', requireAuth, async (c) => {
  const user = c.get('user')!;

  return success(c, {
    welcome: `Welcome back, ${user.name || user.email}!`,
    quickStats: {
      newNotifications: 5,
      pendingTasks: 3,
      recentActivity: 12,
    },
  });
});
