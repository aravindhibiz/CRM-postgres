// This file has been deprecated - use apiClient.js instead
// Supabase has been replaced with FastAPI + PostgreSQL backend

export const supabase = {
  // Stub methods to prevent errors if anything still tries to use this
  from: () => {
    throw new Error('Supabase has been replaced with FastAPI backend. Use apiClient instead.');
  },
  auth: {
    getSession: () => Promise.reject(new Error('Use AuthContext instead')),
    signInWithPassword: () => Promise.reject(new Error('Use AuthContext instead')),
    signUp: () => Promise.reject(new Error('Use AuthContext instead')),
    signOut: () => Promise.reject(new Error('Use AuthContext instead')),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
};

// Log a warning if this file is imported
console.warn('⚠️  DEPRECATED: supabase.js is deprecated. Use apiClient.js instead!');