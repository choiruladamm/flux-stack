import { $ } from 'bun';

/**
 * Script to run database migrations inside the Docker container using Bun Shell.
 * This replaces the previous bash script for better type-safety and integration.
 */
async function runMigrations() {
  console.log('🔄 Running database migrations via Bun Shell...');

  const containerName = 'flux-stack-db';
  const dbUser = 'flux';
  const dbName = 'flux_stack';

  try {
    // 1. Check if container is running
    const psResult =
      await $`docker ps --filter "name=${containerName}" --format "{{.Names}}"`.text();
    if (!psResult.includes(containerName)) {
      console.error(`❌ Error: ${containerName} container is not running`);
      console.log('👉 Run: docker-compose up -d');
      process.exit(1);
    }

    // 2. Wait for PostgreSQL to be ready
    console.log('⏳ Waiting for PostgreSQL to be ready...');
    try {
      await $`docker exec ${containerName} pg_isready -U ${dbUser}`.quiet();
    } catch {
      console.error('❌ PostgreSQL is not ready');
      process.exit(1);
    }

    // 3. Apply migrations
    const migrationPath = 'src/db/migrations';
    const migrationFiles = await $`ls ${migrationPath}/*.sql`.text();

    if (!migrationFiles.trim()) {
      console.warn(`⚠️ No migration files found in ${migrationPath}/`);
      return;
    }

    const files = migrationFiles.trim().split('\n');
    let migrationCount = 0;

    for (const file of files) {
      const fileName = file.split('/').pop();
      console.log(`📄 Applying: ${fileName}`);

      // We use .nothrow() if we want to handle errors manually,
      // but here we let it throw to the catch block for simplicity.
      await $`docker exec -i ${containerName} psql -U ${dbUser} -d ${dbName} < ${file}`.quiet();
      migrationCount++;
    }

    console.log(`✅ Successfully applied ${migrationCount} migration(s)`);
  } catch (error) {
    console.error(
      '❌ Unexpected error during migration:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

runMigrations();
