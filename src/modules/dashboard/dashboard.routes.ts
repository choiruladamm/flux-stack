import { Hono } from 'hono';
import { requireAuth, type AppEnv } from '../../middleware/session';
import { success } from '../../utils/response';

export const dashboardRoutes = new Hono<AppEnv>();

/**
 * Get dashboard statistics
 */
dashboardRoutes.get('/stats', requireAuth, async (c) => {
  const user = c.get('user')!;

  return success(c, {
    userId: user.id,
    stats: {
      totalPosts: 10,
      totalViews: 1000,
      totalComments: 50,
    },
    lastActivity: new Date().toISOString(),
  });
});

/**
 * Get user activity feed
 */
dashboardRoutes.get('/activity', requireAuth, async (c) => {
  const user = c.get('user')!;

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
