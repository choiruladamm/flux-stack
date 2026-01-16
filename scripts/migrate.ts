import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { logger } from '../src/core/logger';

const DATABASE_URL = process.env.DATABASE_URL;

console.log('DEBUG: DATABASE_URL =', DATABASE_URL);

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const migrationClient = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(migrationClient);

logger.info('🔄 Running database migrations...');

try {
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  logger.info('✅ Migrations completed successfully');
} catch (error) {
  logger.error({ error }, '❌ Migration failed');
  process.exit(1);
} finally {
  await migrationClient.end();
}
