import { describe, it, expect, vi, beforeEach } from 'vitest';
import { companiesService } from '../companiesService.js';
import { supabase } from '../../lib/supabase.js';

vi.mock('../../lib/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('companiesService', () => {
  let mockQuery;

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
    };
    supabase.from.mockReturnValue(mockQuery);
  });

  describe('getAllCompanies', () => {
    it('should fetch companies successfully', async () => {
      const mockCompanies = [
        { id: 1, name: 'Company 1', industry: 'Tech' }
      ];
      
      mockQuery.order.mockResolvedValue({ 
        data: mockCompanies, 
        error: null 
      });

      const result = await companiesService.getAllCompanies();

      expect(supabase.from).toHaveBeenCalledWith('companies');
      expect(result).toEqual(mockCompanies);
    });

    it('should handle database errors', async () => {
      mockQuery.order.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      });

      await expect(companiesService.getAllCompanies())
        .rejects
        .toThrow('Database error');
    });
  });

  describe('createCompany', () => {
    it('should create a company successfully', async () => {
      const newCompany = { name: 'New Company', industry: 'Tech' };
      const mockCreatedCompany = { id: 1, ...newCompany };
      
      mockQuery.insert.mockReturnThis();
      mockQuery.select.mockReturnThis();
      mockQuery.single.mockResolvedValue({ 
        data: mockCreatedCompany, 
        error: null 
      });

      const result = await companiesService.createCompany(newCompany);

      expect(result).toEqual(mockCreatedCompany);
    });
  });
});
