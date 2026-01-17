import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as dotenv from 'dotenv';

// Load env variables
dotenv.config();

/**
 * Migration script using Native Drizzle Migrator.
 * This connects directly to the database via TCP and runs SQL migrations.
 * Works best when the database port is exposed to the host.
 */
async function runNativeMigration() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  console.log('🔄 Running native Drizzle migration...');

  // Create a single-purpose migration client
  const migrationClient = postgres(dbUrl, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, {
      migrationsFolder: './src/db/migrations',
    });
    console.log('✅ Successfully applied migrations using native migrator');
  } catch (error) {
    console.error('❌ Migration failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runNativeMigration();
