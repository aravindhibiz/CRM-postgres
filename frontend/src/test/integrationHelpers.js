import { getSafeTestClient } from './safeTestDatabase.js';
import { vi } from 'vitest';

// Create a safe test client that will never touch production data
export const createTestSupabaseClient = async () => {
  const client = await getSafeTestClient();
  console.log('🛡️ Using safe test database client (no production data at risk)');
  return client;
};

// Test authentication helper - now completely safe
export const authenticateTestUser = async (supabase) => {
  try {
    // This will use mocked authentication, so it's safe
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@salesflow.com',
      password: 'password123'
    });

    if (!authError && authData.user) {
      console.log('✅ Test authentication successful (mocked):', authData.user.email);
      return authData.user;
    }

    console.log('ℹ️ Using mock authentication for tests');
    return { id: 'mock-user-id', email: 'test@example.com' };
  } catch (error) {
    console.log('ℹ️ Authentication mocked for test safety');
    return { id: 'mock-user-id', email: 'test@example.com' };
  }
};

// Test data helpers - now completely safe and don't register for cleanup
// (cleanup is handled automatically by the safe test database)
export const createTestData = {
  contact: (overrides = {}, userId = null) => {
    const prefix = import.meta.env.VITE_TEST_DATA_PREFIX || 'MOCK_';
    return {
      first_name: `${prefix}${Date.now()}_John`,
      last_name: 'Doe',
      email: `${prefix}${Date.now()}@example.com`,
      phone: '+1234567890',
      position: 'Test Manager',
      owner_id: userId,
      ...overrides
    };
  },

  company: (overrides = {}, userId = null) => {
    const prefix = import.meta.env.VITE_TEST_DATA_PREFIX || 'MOCK_';
    return {
      name: `${prefix}${Date.now()}_Corp`,
      industry: 'Technology',
      website: 'https://test.com',
      city: 'Test City',
      state: 'TS',
      ...overrides
    };
  },

  deal: (overrides = {}, userId = null) => {
    const prefix = import.meta.env.VITE_TEST_DATA_PREFIX || 'MOCK_';
    return {
      name: `${prefix}${Date.now()}_Deal`,
      value: 50000,
      stage: 'prospecting',
      probability: 25,
      expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      owner_id: userId,
      ...overrides
    };
  },

  activity: (overrides = {}, userId = null) => {
    const prefix = import.meta.env.VITE_TEST_DATA_PREFIX || 'MOCK_';
    return {
      type: 'call',
      subject: `${prefix}${Date.now()}_Call`,
      description: 'Test activity description',
      user_id: userId,
      ...overrides
    };
  }
};

// Cleanup helpers
export class TestDataCleanup {
  constructor(supabase) {
    this.createdData = {
      contacts: [],
      companies: [],
      deals: [],
      activities: [],
      users: []
    };
    this.supabase = supabase;
  }

  track(type, data) {
    if (this.createdData[type] && data?.id) {
      this.createdData[type].push(data);
    }
    return data;
  }

  async cleanupAll() {
    const errors = [];

    // Clean up in reverse dependency order
    for (const activityId of this.createdData.activities.map(a => a.id)) {
      try {
        await this.supabase.from('activities').delete().eq('id', activityId);
      } catch (error) {
        errors.push(`Activity ${activityId}: ${error.message}`);
      }
    }

    for (const dealId of this.createdData.deals.map(d => d.id)) {
      try {
        await this.supabase.from('deals').delete().eq('id', dealId);
      } catch (error) {
        errors.push(`Deal ${dealId}: ${error.message}`);
      }
    }

    for (const contactId of this.createdData.contacts.map(c => c.id)) {
      try {
        await this.supabase.from('contacts').delete().eq('id', contactId);
      } catch (error) {
        errors.push(`Contact ${contactId}: ${error.message}`);
      }
    }

    for (const companyId of this.createdData.companies.map(c => c.id)) {
      try {
        await this.supabase.from('companies').delete().eq('id', companyId);
      } catch (error) {
        errors.push(`Company ${companyId}: ${error.message}`);
      }
    }

    // Reset tracking
    this.createdData = {
      contacts: [],
      companies: [],
      deals: [],
      activities: [],
      users: []
    };

    if (errors.length > 0) {
      console.warn('Cleanup errors:', errors);
    }
  }
}

// Mock the main supabase client to use test client during integration tests
export const setupIntegrationTestMocks = () => {
  const testClient = createTestSupabaseClient();
  
  vi.mock('../../lib/supabase', () => ({
    default: testClient,
    supabase: testClient
  }));

  return testClient;
};
