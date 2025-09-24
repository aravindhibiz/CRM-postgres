import { vi } from 'vitest';

// Runtime service patching for integration tests
// This patches already imported services to use our mock client

export function patchServiceWithMockClient(service, mockClient, serviceName = 'service') {
  if (!service || typeof service !== 'object') {
    console.warn(`⚠️ Cannot patch ${serviceName}: not an object`);
    return service;
  }

  console.log(`🔧 Patching ${serviceName} with mock supabase client`);

  // Create a proxy that intercepts service calls and injects the mock client
  return new Proxy(service, {
    get(target, prop) {
      const originalMethod = target[prop];
      
      if (typeof originalMethod === 'function') {
        return function(...args) {
          // Try to patch the supabase reference before calling the method
          if (global.supabase) {
            global.supabase = mockClient;
          }
          
          // Patch common patterns
          if (this && this.supabase) {
            this.supabase = mockClient;
          }
          
          return originalMethod.apply(this, args);
        };
      }
      
      return originalMethod;
    }
  });
}

// Monkey patch the supabase import globally
export function setupGlobalSupabasePatch(mockClient) {
  // Set global references
  global.supabase = mockClient;
  globalThis.supabase = mockClient;
  
  // Try to patch window if available
  if (typeof window !== 'undefined') {
    window.supabase = mockClient;
  }
  
  console.log('🌐 Global supabase references patched with mock client');
}
