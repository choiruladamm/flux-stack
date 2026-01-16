import type { Session } from '../../core/auth';

export type AuthSession = Session;

export type AuthUser = NonNullable<Session['user']>;

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResponse<T = unknown> {
  data?: T;
  error?: AuthError;
}
