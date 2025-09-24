import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase before importing the service
vi.mock('../../lib/supabase', () => {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis()
  };

  return {
    supabase: {
      from: vi.fn(() => mockQuery),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        admin: {
          inviteUserByEmail: vi.fn()
        },
        signUp: vi.fn()
      }
    }
  };
});

import { userService } from '../userService';
import { supabase } from '../../lib/supabase';

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUserProfile', () => {
    it('should get current user profile successfully', async () => {
      const mockUser = { id: '123' };
      const mockProfile = { id: '123', email: 'test@example.com', role: 'sales_rep' };
      
      supabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });
      
      const selectMock = supabase.from().select();
      selectMock.eq().single.mockResolvedValue({ 
        data: mockProfile, 
        error: null 
      });

      const result = await userService.getCurrentUserProfile();

      expect(result).toEqual(mockProfile);
      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('should handle auth errors', async () => {
      supabase.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: { message: 'No user found' }
      });

      const result = await userService.getCurrentUserProfile();
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const mockUser = { id: '123' };
      supabase.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });
      
      const selectMock = supabase.from().select();
      selectMock.eq().single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Profile not found' }
      });

      await expect(userService.getCurrentUserProfile()).rejects.toThrow('Profile not found');
    });
  });

  describe('createUserProfile', () => {
    it('should create user profile successfully', async () => {
      const userData = {
        id: '123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'sales_rep'
      };

      const insertMock = supabase.from().insert();
      insertMock.select().single.mockResolvedValue({ 
        data: userData, 
        error: null 
      });

      const result = await userService.createUserProfile(userData);

      expect(result).toEqual(userData);
      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('should handle creation errors', async () => {
      const userData = { id: '123', email: 'test@example.com' };
      
      const insertMock = supabase.from().insert();
      insertMock.select().single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Duplicate key' }
      });

      await expect(userService.createUserProfile(userData)).rejects.toThrow('Duplicate key');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = '123';
      const updates = { first_name: 'Jane', last_name: 'Smith' };
      const updatedProfile = { id: userId, ...updates };

      const updateMock = supabase.from().update();
      updateMock.eq().select().single.mockResolvedValue({ 
        data: updatedProfile, 
        error: null 
      });

      const result = await userService.updateUserProfile(userId, updates);

      expect(result).toEqual(updatedProfile);
      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    });
  });

  describe('getUserStats', () => {
    it('should calculate user statistics correctly', async () => {
      const mockUsers = [
        { role: 'admin', is_active: true, created_at: new Date().toISOString() },
        { role: 'sales_rep', is_active: true, created_at: '2024-01-01' },
        { role: 'sales_rep', is_active: false, created_at: '2024-01-01' },
        { role: 'manager', is_active: true, created_at: new Date().toISOString() }
      ];

      supabase.from().select.mockResolvedValue({ 
        data: mockUsers, 
        error: null 
      });

      const result = await userService.getUserStats();

      expect(result.total).toBe(4);
      expect(result.active).toBe(3);
      expect(result.inactive).toBe(1);
      expect(result.byRole.sales_rep).toBe(2);
      expect(result.byRole.admin).toBe(1);
      expect(result.byRole.manager).toBe(1);
      expect(result.recentlyJoined).toBe(2); // Users created within 30 days
    });

    it('should handle empty user data', async () => {
      supabase.from().select.mockResolvedValue({ 
        data: [], 
        error: null 
      });

      const result = await userService.getUserStats();

      expect(result.total).toBe(0);
      expect(result.active).toBe(0);
      expect(result.inactive).toBe(0);
      expect(result.recentlyJoined).toBe(0);
    });
  });

  describe('generateTempPassword', () => {
    it('should generate a password of correct length', () => {
      const password = userService.generateTempPassword();
      
      expect(typeof password).toBe('string');
      expect(password.length).toBeGreaterThan(8);
    });

    it('should generate different passwords on multiple calls', () => {
      const password1 = userService.generateTempPassword();
      const password2 = userService.generateTempPassword();
      
      expect(password1).not.toBe(password2);
    });
  });

  describe('getUserRoles', () => {
    it('should return correct user roles', () => {
      const roles = userService.getUserRoles();
      
      expect(roles).toHaveLength(4);
      expect(roles).toContainEqual({ value: 'admin', label: 'Administrator' });
      expect(roles).toContainEqual({ value: 'manager', label: 'Sales Manager' });
      expect(roles).toContainEqual({ value: 'sales_rep', label: 'Sales Representative' });
      expect(roles).toContainEqual({ value: 'user', label: 'User' });
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      const userId = '123';
      const deactivatedUser = { id: userId, is_active: false };

      const mockQuery = supabase.from();
      mockQuery.update.mockReturnThis();
      mockQuery.eq.mockReturnThis();
      mockQuery.select.mockReturnThis();
      mockQuery.single.mockResolvedValue({ 
        data: deactivatedUser, 
        error: null 
      });

      const result = await userService.deactivateUser(userId);

      expect(result).toEqual(deactivatedUser);
      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    });
  });

  describe('activateUser', () => {
    it('should activate user successfully', async () => {
      const userId = '123';
      const activatedUser = { id: userId, is_active: true };

      const mockQuery = supabase.from();
      mockQuery.update.mockReturnThis();
      mockQuery.eq.mockReturnThis();
      mockQuery.select.mockReturnThis();
      mockQuery.single.mockResolvedValue({ 
        data: activatedUser, 
        error: null 
      });

      const result = await userService.activateUser(userId);

      expect(result).toEqual(activatedUser);
      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    });
  });
});
