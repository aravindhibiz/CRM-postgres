import { vi, afterEach } from 'vitest';
import { safeTestDB, cleanupTestData } from './safeTestDatabase.js';

// Integration test setup - this file ensures tests use safe database operations

console.warn('🧪 INTEGRATION TEST MODE: All database operations are safely isolated');

// Get the safe test database client
const testClient = await safeTestDB.getClient();

// Mock the supabase client to use our safe test client
vi.mock('../lib/supabase', () => {
  return {
    supabase: testClient
  };
});

// Load test environment variables
const originalEnv = import.meta.env;

// Override environment variables for integration tests
vi.stubGlobal('import.meta', {
  env: {
    ...originalEnv,
    // Use test environment variables
    VITE_SUPABASE_URL: 'mock://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'mock-test-key',
    // Add test mode flag
    VITE_TEST_MODE: 'integration',
    VITE_TEST_DATA_PREFIX: 'VITEST_' + Date.now() + '_'
  }
});

console.warn('🛡️ Using safe test database client (no production data at risk)');

// Global cleanup after each test
afterEach(async () => {
  await cleanupTestData();
});
