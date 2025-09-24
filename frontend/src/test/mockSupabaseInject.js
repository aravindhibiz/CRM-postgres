import { vi } from 'vitest';
import { safeTestDB } from './safeTestDatabase.js';

// This utility intercepts and replaces supabase imports at the service level

export async function setupSupabaseMocks() {
  const testClient = await safeTestDB.getClient();
  
  // Direct import interception for the main supabase module
  vi.doMock('../lib/supabase.js', () => ({
    supabase: testClient,
    default: testClient
  }));
  
  vi.doMock('../lib/supabase', () => ({
    supabase: testClient,
    default: testClient
  }));
  
  vi.doMock('@/lib/supabase', () => ({
    supabase: testClient,
    default: testClient
  }));
  
  // For createClient imports
  vi.doMock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => testClient),
    default: {
      createClient: vi.fn(() => testClient)
    }
  }));
  
  return testClient;
}

// Helper function to inject mock client into imported services
export async function injectMockSupabase(serviceImport) {
  const testClient = await safeTestDB.getClient();
  
  // If the service has already been imported, we need to replace the supabase reference
  if (serviceImport && typeof serviceImport === 'object') {
    // Look for any supabase references and replace them
    Object.keys(serviceImport).forEach(key => {
      if (serviceImport[key] && typeof serviceImport[key] === 'object') {
        // Try to find and replace supabase instances
        if (serviceImport[key].supabase) {
          serviceImport[key].supabase = testClient;
        }
      }
    });
  }
  
  return testClient;
}
