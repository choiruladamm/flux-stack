import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../core/env';
import * as authSchema from '../modules/auth/db/auth.schema';
import * as postsSchema from '../modules/posts/db/posts.schema';

/**
 * Central schema registry for Drizzle ORM
 *
 * This object contains all database table schemas from different modules.
 * Drizzle requires this schema registry to:
 * - Enable relational queries with automatic joins
 * - Support TypeScript autocomplete for queries
 * - Handle foreign key relationships and cascading deletes
 * - Provide Better Auth adapter with access to auth tables
 *
 * @example Adding a new module schema
 * ```typescript
 * import * as commentsSchema from '../modules/comments/db/comments.schema';
 * const schema = { ...authSchema, ...postsSchema, ...commentsSchema };
 * ```
 *
 * @see {@link https://orm.drizzle.team/docs/rqb Drizzle Relational Queries}
 */
const schema = { ...authSchema, ...postsSchema };

const queryClient = postgres(env.DATABASE_URL);

export const db = drizzle(queryClient, { schema });
