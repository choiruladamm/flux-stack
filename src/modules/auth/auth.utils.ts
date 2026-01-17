import { passwordSchema } from './auth.validation';

/**
 * Validates password against security requirements
 *
 * @param password - The password to validate
 * @returns Validation result with error message if invalid
 */
export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  const result = passwordSchema.safeParse(password);

  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues[0]?.message || 'Invalid password',
    };
  }

  return { valid: true };
};

/**
 * Validates email format using regex
 *
 * @param email - The email address to validate
 * @returns True if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
