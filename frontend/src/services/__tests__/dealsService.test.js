import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dealsService } from '../dealsService';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
vi.mock('@/lib/supabase');

describe('dealsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserDeals', () => {
    it('should fetch user deals successfully', async () => {
      const mockDeals = [
        {
          id: '1',
          name: 'Test Deal',
          value: 50000,
          stage: 'qualification',
          contact: { first_name: 'John', last_name: 'Doe' },
        },
      ];

      const mockResponse = {
        data: mockDeals,
        error: null,
      };

      const mockOrder = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({
        order: mockOrder,
      });
      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      supabase.from = mockFrom;

      const result = await dealsService.getUserDeals();

      expect(mockFrom).toHaveBeenCalledWith('deals');
      expect(result).toEqual(mockDeals);
    });

    it('should handle empty deals list', async () => {
      const mockResponse = {
        data: [],
        error: null,
      };

      const mockOrder = vi.fn().mockResolvedValue(mockResponse);
      const mockSelect = vi.fn().mockReturnValue({
        order: mockOrder,
      });
      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      supabase.from = mockFrom;

      const result = await dealsService.getUserDeals();

      expect(result).toEqual([]);
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

      await expect(dealsService.getUserDeals()).rejects.toThrow('Database error');
    });
  });

  describe('getDealById', () => {
    it('should fetch deal by id successfully', async () => {
      const mockDeal = {
        id: '1',
        name: 'Test Deal',
        value: 50000,
        stage: 'qualification',
      };

      const mockResponse = {
        data: mockDeal,
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

      const result = await dealsService.getDealById('1');

      expect(mockFrom).toHaveBeenCalledWith('deals');
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockDeal);
    });
  });
});
