import type { Context } from 'hono';

/**
 * Check if user is authenticated
 *
 * @param c - Hono context
 * @returns True if user session exists
 */
export const isAuthenticated = (c: Context): boolean => {
  return c.get('user') !== null;
};

/**
 * Get authenticated user or throw error
 *
 * @param c - Hono context
 * @returns Authenticated user object
 * @throws Error if not authenticated
 */
export const getAuthUser = (c: Context) => {
  const user = c.get('user');
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user;
};

/**
 * Get user ID from session
 *
 * @param c - Hono context
 * @returns User ID if authenticated, null otherwise
 */
export const getUserId = (c: Context): string | null => {
  const user = c.get('user');
  return user?.id || null;
};

/**
 * Check if user owns a resource
 *
 * @param c - Hono context
 * @param resourceUserId - User ID that owns the resource
 * @returns True if current user owns the resource
 */
export const ownsResource = (c: Context, resourceUserId: string): boolean => {
  const userId = getUserId(c);
  return userId === resourceUserId;
};

/**
 * Get session info
 *
 * @param c - Hono context
 * @returns Session object if exists
 */
export const getSession = (c: Context) => {
  return c.get('session');
};
