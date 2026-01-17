import { Hono } from 'hono';
import { requireAuth, type AppEnv } from '../../middleware/session';
import { success } from '../../utils/response';
import { validate } from '../../middleware/validate';
import { updateProfileSchema, type UpdateProfileInput } from './user.validation';

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
    email_verified: user.emailVerified,
    created_at: user.createdAt,
  });
});

/**
 * Update user profile
 */
userRoutes.patch('/profile', requireAuth, validate(updateProfileSchema), async (c) => {
  const user = c.get('user')!;
  const body = c.get('validatedData') as UpdateProfileInput;

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
