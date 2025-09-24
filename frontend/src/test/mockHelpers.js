import { vi } from 'vitest';

// Create a flexible Supabase mock that can be easily configured per test
export const createSupabaseMock = () => {
  const mockData = { data: [], error: null };
  
  const queryBuilder = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),  // Add missing or method
    single: vi.fn().mockResolvedValue(mockData),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    then: vi.fn().mockResolvedValue(mockData),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    and: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(mockData),
  };

  // Helper to set mock response
  queryBuilder.mockResolvedValue = (value) => {
    Object.assign(mockData, value);
    queryBuilder.single.mockResolvedValue(value);
    queryBuilder.maybeSingle.mockResolvedValue(value);
    queryBuilder.then.mockImplementation((resolve) => resolve(value));
    return queryBuilder;
  };

  const supabaseMock = {
    from: vi.fn().mockReturnValue(queryBuilder),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue(() => {}),
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null })
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    }
  };

  // Reset function for clean test state
  supabaseMock.resetMocks = () => {
    vi.clearAllMocks();
    Object.assign(mockData, { data: [], error: null });
    supabaseMock.from.mockReturnValue(queryBuilder);
  };

  return { supabaseMock, queryBuilder };
};

// Create axios mock
export const createAxiosMock = () => {
  return {
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
    get: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    options: vi.fn().mockResolvedValue({ data: {} })
  };
};
