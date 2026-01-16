import { Hono } from 'hono';
import { requireAuth, type AppEnv } from '../../middleware/session';
import { success } from '../../utils/response';

export const userRoutes = new Hono<AppEnv>();

/**
 * Get current user profile
 */
userRoutes.get('/profile', requireAuth, (c) => {
  const user = c.get('user')!;

  return success(c, {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  });
});

/**
 * Update user profile
 */
userRoutes.patch('/profile', requireAuth, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json();

  return success(c, {
    message: 'Profile updated successfully',
    user: {
      id: user.id,
      ...body,
    },
  });
});

/**
 * Delete user account
 */
userRoutes.delete('/account', requireAuth, async (c) => {
  const user = c.get('user')!;

  return success(c, {
    message: `Account ${user.email} scheduled for deletion`,
  });
});
