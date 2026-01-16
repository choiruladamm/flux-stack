import postgres from 'postgres';
import { env } from '../src/core/env';

console.log('🔌 Testing Database Connection...');
console.log(
  `URL Has Password? ${env.DATABASE_URL.includes(':') && env.DATABASE_URL.includes('@') && env.DATABASE_URL.split('@')[0].split(':').length > 2}`
);
console.log(`URL: ${env.DATABASE_URL}`); // Print it raw for now, user is safe since we put in dummy pass or no pass

const sql = postgres(env.DATABASE_URL);

async function testConnection() {
  try {
    const version = await sql`SELECT version()`;
    console.log('✅ Connection Success!');
    console.log('📦 PostgreSQL Version:', version[0].version);

    // Check tables
    const tables =
      await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log(
      '📊 Tables:',
      tables.map((t) => t.table_name)
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Connection Failed:', error);
    process.exit(1);
  }
}

testConnection();
