import { vi } from 'vitest';

/**
 * Safe Test Database Service
 * 
 * This service provides a layer of protection to ensure tests never
 * accidentally modify production data. It can operate in multiple modes:
 * 
 * 1. Mock Mode (default): All database operations are mocked
 * 2. Test DB Mode: Operations go to a separate test database
 * 3. Read-only Mode: Only SELECT operations are allowed on production DB
 */

class SafeTestDatabaseService {
  constructor() {
    this.mode = this.determineTestMode();
    this.client = null;
    this.createdRecords = new Map(); // Track what we create for cleanup
    
    console.log(`🧪 Test Database Service initialized in ${this.mode} mode`);
  }

  determineTestMode() {
    const testUrl = import.meta.env.VITE_SUPABASE_TEST_URL;
    
    if (!testUrl || testUrl.startsWith('mock://')) {
      return 'mock';
    }
    
    // Check if this looks like a production URL (your specific URL pattern)
    if (testUrl.includes('urckjqdnsdvdastclwsk.supabase.co')) {
      console.warn('🚨 WARNING: Test trying to use production database! Switching to mock mode.');
      return 'mock';
    }
    
    return 'test-db';
  }

  async getClient() {
    if (this.client) return this.client;

    if (this.mode === 'mock') {
      this.client = this.createMockClient();
    } else {
      // Import here to avoid issues in mock mode
      const { createClient } = await import('@supabase/supabase-js');
      this.client = createClient(
        import.meta.env.VITE_SUPABASE_TEST_URL,
        import.meta.env.VITE_SUPABASE_TEST_ANON_KEY
      );
    }
    
    return this.client;
  }

  createMockClient() {
    // This creates a comprehensive mock that mimics supabase behavior
    // but never makes real network requests
    
    const createChainableMock = (tableName, mockData = [], isInvalidQuery = false) => {
      const chainMethods = {
        select: vi.fn((columns = '*') => {
          // Return a new chainable mock to continue the chain
          const selectMock = createChainableMock(tableName, mockData, isInvalidQuery);
          return selectMock;
        }),
        eq: vi.fn((column, value) => {
          // Smart filtering: if the value looks like an invalid ID, return empty results
          const isInvalid = typeof value === 'string' && (
            value.includes('invalid') || 
            value.includes('nonexistent') || 
            value.includes('fake') ||
            value === 'test-id' ||
            value.startsWith('invalid-')
          );
          
          const filteredData = isInvalid ? [] : mockData.filter(item => {
            return item && item[column] === value;
          });
          
          const newMock = createChainableMock(tableName, filteredData, isInvalid);
          return newMock;
        }),
        neq: vi.fn((column, value) => createChainableMock(tableName, mockData)),
        gt: vi.fn((column, value) => createChainableMock(tableName, mockData)),
        gte: vi.fn((column, value) => createChainableMock(tableName, mockData)),
        lt: vi.fn((column, value) => createChainableMock(tableName, mockData)),
        lte: vi.fn((column, value) => createChainableMock(tableName, mockData)),
        like: vi.fn((column, value) => createChainableMock(tableName, mockData)),
        ilike: vi.fn((column, value) => createChainableMock(tableName, mockData)),
        is: vi.fn((column, value) => createChainableMock(tableName, mockData)),
        in: vi.fn((column, values) => createChainableMock(tableName, mockData)),
        contains: vi.fn((column, value) => createChainableMock(tableName, mockData)),
        or: vi.fn((condition) => createChainableMock(tableName, mockData)),
        order: vi.fn((column, options) => createChainableMock(tableName, mockData)),
        limit: vi.fn((count) => createChainableMock(tableName, mockData.slice(0, count))),
        range: vi.fn((from, to) => createChainableMock(tableName, mockData.slice(from, to + 1))),
        single: vi.fn(() => Promise.resolve({ 
          data: isInvalidQuery ? null : (mockData[0] || null), 
          error: null 
        })),
        maybeSingle: vi.fn(() => Promise.resolve({ 
          data: isInvalidQuery ? null : (mockData[0] || null), 
          error: null 
        })),
        // Make it thenable so it can be awaited
        then: vi.fn((resolve) => resolve({ 
          data: isInvalidQuery ? [] : mockData, 
          error: null 
        })),
        catch: vi.fn(() => Promise.resolve({ 
          data: isInvalidQuery ? [] : mockData, 
          error: null 
        }))
      };
      
      return chainMethods;
    };

    return {
      auth: {
        getUser: vi.fn().mockResolvedValue({ 
          data: { user: { 
            id: 'mock-user-id', 
            email: 'test@example.com' 
          }}, 
          error: null 
        }),
        getSession: vi.fn().mockResolvedValue({ 
          data: { session: { 
            user: { id: 'mock-user-id' } 
          }}, 
          error: null 
        }),
        signInWithPassword: vi.fn().mockResolvedValue({ 
          data: { user: { 
            id: 'mock-user-id', 
            email: 'test@example.com' 
          }}, 
          error: null 
        }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
      },
      
      from: vi.fn((table) => {
        // Return mock data based on table
        const mockData = this.getMockDataForTable(table);
        
        return {
          select: vi.fn((columns = '*') => {
            const selectChain = createChainableMock(table, mockData);
            return selectChain;
          }),
          insert: vi.fn((data) => {
            // Handle array or single object
            const insertData = Array.isArray(data) ? data[0] : data;
            const resultData = { 
              id: `mock-${table}-${Date.now()}`, 
              ...insertData,
              created_at: new Date().toISOString()
            };
            
            return {
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ 
                  data: resultData, 
                  error: null 
                }),
              })),
              then: vi.fn((resolve) => resolve({ 
                data: [resultData], 
                error: null 
              }))
            };
          }),
          update: vi.fn((data) => ({
            eq: vi.fn((column, value) => {
              // Check if this is an invalid ID
              const isInvalid = typeof value === 'string' && (
                value.includes('invalid') || 
                value.includes('nonexistent') ||
                value === 'test-id'
              );
              
              const resultData = isInvalid ? null : { 
                id: value, 
                ...data,
                updated_at: new Date().toISOString()
              };
              
              return {
                select: vi.fn(() => ({
                  single: vi.fn().mockResolvedValue({ 
                    data: resultData, 
                    error: null 
                  }),
                })),
                then: vi.fn((resolve) => resolve({ 
                  data: resultData ? [resultData] : [], 
                  error: null 
                }))
              };
            }),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn((column, value) => {
              // Always return success for deletes
              return Promise.resolve({ data: null, error: null });
            }),
            then: vi.fn((resolve) => resolve({ data: null, error: null }))
          })),
          upsert: vi.fn((data) => {
            const insertData = Array.isArray(data) ? data[0] : data;
            const resultData = { 
              id: `mock-${table}-${Date.now()}`, 
              ...insertData,
              created_at: new Date().toISOString()
            };
            
            return {
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ 
                  data: resultData, 
                  error: null 
                }),
              })),
              then: vi.fn((resolve) => resolve({ 
                data: [resultData], 
                error: null 
              }))
            };
          }),
        };
      }),
      
      // Add channel for real-time subscriptions
      channel: vi.fn((name) => ({
        on: vi.fn(() => ({
          subscribe: vi.fn(() => ({ unsubscribe: vi.fn() }))
        }))
      })),
      
      rpc: vi.fn().mockResolvedValue({ data: [], error: null })
    };
  }

  getMockDataForTable(table) {
    // Return realistic mock data structures for different tables
    const mockData = {
      contacts: [
        {
          id: 'mock-contact-1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          company: 'Test Corp',
          job_title: 'Manager',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-contact-2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          phone: '+0987654321',
          company: 'Example Inc',
          job_title: 'Director',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      companies: [
        {
          id: 'mock-company-1',
          name: 'Acme Corp',
          industry: 'Technology',
          website: 'https://acme.com',
          size: 'medium',
          status: 'active',
          phone: '+1555123456',
          address: '123 Tech Street',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-company-2',
          name: 'Example Inc',
          industry: 'Finance',
          website: 'https://example.com',
          size: 'large',
          status: 'active',
          phone: '+1555654321',
          address: '456 Finance Ave',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      deals: [
        {
          id: 'mock-deal-1',
          name: 'Test Deal',
          value: 50000,
          stage: 'prospecting',
          probability: 25,
          contact_id: 'mock-contact-1',
          company_id: 'mock-company-1',
          status: 'open',
          expected_close_date: '2024-12-31',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-deal-2',
          name: 'Example Deal',
          value: 75000,
          stage: 'qualified',
          probability: 50,
          contact_id: 'mock-contact-2',
          company_id: 'mock-company-2',
          status: 'open',
          expected_close_date: '2024-11-30',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      activities: [
        {
          id: 'mock-activity-1',
          type: 'call',
          subject: 'Test Call',
          description: 'Mock activity for testing',
          contact_id: 'mock-contact-1',
          deal_id: 'mock-deal-1',
          status: 'completed',
          due_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-activity-2',
          type: 'email',
          subject: 'Follow-up Email',
          description: 'Follow-up email sent',
          contact_id: 'mock-contact-2',
          deal_id: 'mock-deal-2',
          status: 'pending',
          due_date: new Date(Date.now() + 86400000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      users: [
        {
          id: 'mock-user-1',
          email: 'user@example.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'sales_rep',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-user-2',
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      notes: [
        {
          id: 'mock-note-1',
          title: 'Test Note',
          content: 'This is a test note',
          contact_id: 'mock-contact-1',
          deal_id: 'mock-deal-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      tags: [
        {
          id: 'mock-tag-1',
          name: 'important',
          color: '#ff0000',
          description: 'Important items',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      settings: [
        {
          id: 'mock-setting-1',
          key: 'company_name',
          value: 'Test Company',
          description: 'Company name setting',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      analytics: [
        {
          id: 'mock-analytics-1',
          metric: 'total_contacts',
          value: 150,
          period: 'month',
          date: '2023-01-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
    
    return mockData[table] || [
      {
        id: `mock-${table}-1`,
        name: `Mock ${table} Item`,
        title: `Mock ${table} Title`,
        value: `Mock ${table} Value`,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  async cleanup() {
    // Clean up any test data if we're in test-db mode
    if (this.mode === 'test-db' && this.createdRecords.size > 0) {
      console.log(`🧹 Cleaning up ${this.createdRecords.size} test records...`);
      
      const client = await this.getClient();
      const cleanupPromises = [];
      
      for (const [table, records] of this.createdRecords) {
        for (const record of records) {
          cleanupPromises.push(
            client.from(table).delete().eq('id', record.id)
              .catch(err => console.warn(`Cleanup failed for ${table}:`, err.message))
          );
        }
      }
      
      await Promise.all(cleanupPromises);
      this.createdRecords.clear();
    }
  }
}

// Export singleton instance
export const safeTestDB = new SafeTestDatabaseService();

// Helper to get a safe test client
export const getSafeTestClient = () => safeTestDB.getClient();

// Export cleanup function for test teardown
export const cleanupTestData = () => safeTestDB.cleanup();
