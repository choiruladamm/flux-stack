import { z } from 'zod';
import { STRING_LIMITS } from '../../constants';

/**
 * Update profile request schema
 */
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(STRING_LIMITS.NAME_MAX).optional(),
  bio: z.string().max(STRING_LIMITS.DESCRIPTION_MAX).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
