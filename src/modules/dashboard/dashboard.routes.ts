import { Hono } from 'hono';
import { requireAuth, type AppEnv } from '../../middleware/session';
import { success, paginated } from '../../utils/response';
import { validate } from '../../middleware/validate';
import { paginationSchema, type PaginationInput } from './dashboard.validation';

export const dashboardRoutes = new Hono<AppEnv>();

/**
 * Get dashboard statistics
 */
dashboardRoutes.get('/stats', requireAuth, validate(paginationSchema, 'query'), async (c) => {
  const user = c.get('user')!;
  const { page, limit } = c.get('validatedData') as PaginationInput;

  return paginated(
    c,
    {
      user_id: user.id,
      stats: {
        total_posts: 10,
        total_views: 1000,
        total_comments: 50,
      },
      last_activity: new Date().toISOString(),
    },
    {
      page,
      limit,
      total: 1, // Mock total
      total_pages: 1,
    }
  );
});

/**
 * Get user activity feed
 */
dashboardRoutes.get('/activity', requireAuth, validate(paginationSchema, 'query'), async (c) => {
  const user = c.get('user')!;
  const { page, limit } = c.get('validatedData') as PaginationInput;

  return paginated(
    c,
    {
      user_id: user.id,
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
    },
    {
      page,
      limit,
      total: 2, // Mock total
      total_pages: 1,
    }
  );
});

/**
 * Get dashboard overview
 */
dashboardRoutes.get('/overview', requireAuth, async (c) => {
  const user = c.get('user')!;

  return success(c, {
    welcome: `Welcome back, ${user.name || user.email}!`,
    quick_stats: {
      new_notifications: 5,
      pending_tasks: 3,
      recent_activity: 12,
    },
  });
});
