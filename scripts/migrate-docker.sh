#!/bin/bash
set -e

echo "🔄 Running database migrations via Docker..."

# Check if container is running
if ! docker ps | grep -q flux-stack-db; then
  echo "❌ Error: flux-stack-db container is not running"
  echo "Run: docker-compose up -d"
  exit 1
fi

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
docker exec flux-stack-db pg_isready -U flux > /dev/null 2>&1 || {
  echo "❌ PostgreSQL is not ready"
  exit 1
}

# Apply migrations
MIGRATION_COUNT=0
for file in src/db/migrations/*.sql; do
  if [ -f "$file" ]; then
    echo "📄 Applying: $(basename $file)"
    docker exec -i flux-stack-db psql -U flux -d flux_stack < "$file"
    MIGRATION_COUNT=$((MIGRATION_COUNT + 1))
  fi
done

if [ $MIGRATION_COUNT -eq 0 ]; then
  echo "⚠️  No migration files found in src/db/migrations/"
else
  echo "✅ Successfully applied $MIGRATION_COUNT migration(s)"
fi
