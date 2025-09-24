import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Make React available globally for mocks
global.React = React;

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock environment variables for unit tests
vi.mock('import.meta', () => ({
  env: {
    VITE_SUPABASE_URL: 'https://mock-test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'mock-test-anon-key',
    VITE_TEST_MODE: 'unit'
  },
}));

// Mock supabase client with safe, predictable responses for unit tests
const createSafeMockSupabaseClient = () => {
  const createChainableMock = (finalResult = { data: [], error: null }) => {
    const mock = vi.fn(() => ({
      select: vi.fn(() => mock),
      eq: vi.fn(() => mock),
      neq: vi.fn(() => mock),
      gt: vi.fn(() => mock),
      gte: vi.fn(() => mock),
      lt: vi.fn(() => mock),
      lte: vi.fn(() => mock),
      like: vi.fn(() => mock),
      ilike: vi.fn(() => mock),
      is: vi.fn(() => mock),
      in: vi.fn(() => mock),
      contains: vi.fn(() => mock),
      order: vi.fn(() => mock),
      limit: vi.fn(() => mock),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      then: vi.fn((resolve) => resolve(finalResult)),
      // Make it thenable so it can be awaited
      catch: vi.fn(() => Promise.resolve(finalResult))
    }));
    return mock;
  };

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signIn: vi.fn().mockResolvedValue({ data: null, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn((table) => {
      const mockQuery = createChainableMock();
      return {
        select: mockQuery,
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
          })),
          then: vi.fn((resolve) => resolve({ data: { id: 'mock-id' }, error: null }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
            })),
            then: vi.fn((resolve) => resolve({ data: { id: 'mock-id' }, error: null }))
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          then: vi.fn((resolve) => resolve({ data: null, error: null }))
        })),
        upsert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null }),
          })),
          then: vi.fn((resolve) => resolve({ data: { id: 'mock-id' }, error: null }))
        })),
      };
    }),
    // Add RPC mock
    rpc: vi.fn().mockResolvedValue({ data: null, error: null })
  };
};

const mockSupabaseClient = createSafeMockSupabaseClient();

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({}),
    useLocation: () => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
    }),
  };
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
