import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock auth context value
const mockAuthContext = {
  user: null,
  loading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
};

// Mock theme context value
const mockThemeContext = {
  theme: 'light',
  toggleTheme: vi.fn(),
};

// Custom render function that includes providers
export function renderWithProviders(ui, options = {}) {
  const {
    initialEntries = ['/'],
    authContextValue = mockAuthContext,
    themeContextValue = mockThemeContext,
    ...renderOptions
  } = options;

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <ThemeProvider value={themeContextValue}>
          <AuthProvider value={authContextValue}>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    mockAuthContext,
    mockThemeContext,
  };
}

// Mock data generators
export const mockUser = {
  id: '12345',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  created_at: new Date().toISOString(),
};

export const mockContact = {
  id: '1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  company_id: '1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockCompany = {
  id: '1',
  name: 'Test Company',
  website: 'https://testcompany.com',
  industry: 'Technology',
  size: '50-100',
  created_at: new Date().toISOString(),
};

export const mockDeal = {
  id: '1',
  name: 'Test Deal',
  value: 50000,
  stage: 'qualification',
  probability: 75,
  contact_id: '1',
  company_id: '1',
  owner_id: mockUser.id,
  created_at: new Date().toISOString(),
  expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export const mockActivity = {
  id: '1',
  type: 'call',
  description: 'Test activity',
  deal_id: '1',
  contact_id: '1',
  user_id: mockUser.id,
  created_at: new Date().toISOString(),
};

export const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'This is a test task',
  status: 'pending',
  priority: 'medium',
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  assigned_to: mockUser.id,
  created_by: mockUser.id,
  deal_id: '1',
  created_at: new Date().toISOString(),
};

// Export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
