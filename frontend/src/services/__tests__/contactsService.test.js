import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contactsService } from '../contactsService';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
vi.mock('@/lib/supabase');

describe('contactsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserContacts', () => {
    it('should fetch user contacts successfully', async () => {
      const mockContacts = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          company: { name: 'Test Company' },
        },
      ];

      const mockResponse = {
        data: mockContacts,
        error: null,
      };

      // Mock the supabase chain
      const mockOrder = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({
        order: mockOrder,
      });
      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      supabase.from = mockFrom;

      const result = await contactsService.getUserContacts();

      expect(mockFrom).toHaveBeenCalledWith('contacts');
      expect(mockSelect).toHaveBeenCalledWith(`
        *,
        company:company_id(id, name, industry, city, state),
        owner:owner_id(id, first_name, last_name, email),
        deals:deals(id, name, value, stage),
        activities:activities(id, type, subject, created_at)
      `);
      expect(result).toEqual(mockContacts);
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('Database error');
      const mockResponse = {
        data: null,
        error: mockError,
      };

      const mockOrder = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({
        order: mockOrder,
      });
      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      supabase.from = mockFrom;

      await expect(contactsService.getUserContacts()).rejects.toThrow('Database error');
    });
  });

  describe('getContactById', () => {
    it('should fetch contact by id successfully', async () => {
      const mockContact = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      };

      const mockResponse = {
        data: mockContact,
        error: null,
      };

      const mockSingle = vi.fn().mockResolvedValue(mockResponse);
      const mockEq = vi.fn().mockReturnValue({
        single: mockSingle,
      });
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });
      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      supabase.from = mockFrom;

      const result = await contactsService.getContactById('1');

      expect(mockFrom).toHaveBeenCalledWith('contacts');
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockContact);
    });
  });

  describe('createContact', () => {
    it('should create contact successfully', async () => {
      const contactData = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        phone: '+1234567890',
      };

      const mockCreatedContact = {
        id: '2',
        ...contactData,
        created_at: new Date().toISOString(),
      };

      const mockResponse = {
        data: mockCreatedContact,
        error: null,
      };

      const mockSingle = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });
      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      supabase.from = mockFrom;

      const result = await contactsService.createContact(contactData);

      expect(mockFrom).toHaveBeenCalledWith('contacts');
      expect(result).toEqual(mockCreatedContact);
    });
  });
});
