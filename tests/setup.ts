import { config } from 'dotenv';
import { beforeAll, afterAll } from 'bun:test';
import { db } from '../src/core/db';

config();

/**
 * Global test setup
 */
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
});

/**
 * Global test teardown
 */
afterAll(async () => {
  // Cleanup database connections
  try {
    // Note: Drizzle/Postgres might need specific cleanup depending on driver
    // For now we just log completion
    console.log('Test teardown complete');
  } catch (error) {
    console.error('Error during test teardown:', error);
  }
});
