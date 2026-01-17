import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from '../modules/auth/db/auth.schema';
import { env } from './env';
import { logger } from './logger';
import { RATE_LIMIT, DEVELOPMENT_ORIGINS } from '../constants';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      logger.info({ email: user.email, url }, 'Password Reset Link');
      console.log('\n� PASSWORD RESET');
      console.log('To:', user.email);
      console.log('Link:', url);
      console.log('');
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      logger.info({ email: user.email, url }, 'Email Verification Link');
      console.log('\n� EMAIL VERIFICATION');
      console.log('To:', user.email);
      console.log('Link:', url);
      console.log('');
    },
  },

  rateLimit: {
    enabled: env.NODE_ENV !== 'test',
    window: RATE_LIMIT.WINDOW_SECONDS,
    max:
      env.NODE_ENV === 'production'
        ? RATE_LIMIT.MAX_REQUESTS_PRODUCTION
        : RATE_LIMIT.MAX_REQUESTS_DEVELOPMENT,
  },

  baseURL: env.BASE_URL,
  secret: env.JWT_SECRET,

  trustedOrigins:
    env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS?.split(',') || []
      : DEVELOPMENT_ORIGINS,
});

export type Session = typeof auth.$Infer.Session;
