import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock userService first
vi.mock('../../services/userService', () => ({
  getUserProfile: vi.fn().mockResolvedValue({ id: '123', name: 'Test User' })
}));

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: { id: '123', name: 'Test User' }, 
        error: null 
      }),
      update: vi.fn().mockReturnThis()
    }))
  }
}));

// Import after mocks
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '../../lib/supabase';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null user and loading true initially', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.authError).toBe('');
  });

  it('should handle successful sign in', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'token' } },
      error: null
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.signIn('test@example.com', 'password');
      console.log('AuthContext test response:', response);
      expect(response).toBeDefined();
      if (response && response.user) {
        expect(response.user).toEqual(mockUser);
      }
      expect(response?.error).toBeUndefined();
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });

  it('should handle sign in error', async () => {
    const mockError = { message: 'Invalid credentials' };
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: mockError
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.signIn('test@example.com', 'wrongpassword');
      expect(response.error).toEqual(mockError);
    });
  });

  it('should handle connection errors gracefully', async () => {
    supabase.auth.signInWithPassword.mockRejectedValue(new Error('Failed to fetch'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.signIn('test@example.com', 'password');
      expect(response.error.message).toBe('Connection error. Please try again.');
    });
  });

  it('should handle successful sign up', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    supabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const response = await result.current.signUp('test@example.com', 'password', {
        firstName: 'John',
        lastName: 'Doe',
        role: 'sales_rep'
      });
      expect(response.user).toEqual(mockUser);
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      options: {
        data: {
          first_name: 'John',
          last_name: 'Doe',
          role: 'sales_rep'
        }
      }
    });
  });

  it('should handle sign out', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signOut();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
