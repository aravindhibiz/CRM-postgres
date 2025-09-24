import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../ThemeToggle';
import { ThemeContext } from '@/contexts/ThemeContext';

// Mock the Icon component
vi.mock('../AppIcon', () => ({
  default: ({ name, size }) => <span data-testid={`${name.toLowerCase()}-icon`} data-size={size}>{name}</span>
}));

const renderWithThemeContext = (themeContextValue) => {
  return render(
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeToggle />
    </ThemeContext.Provider>
  );
};

describe('ThemeToggle', () => {
  it('renders theme toggle button', () => {
    const mockThemeContext = {
      theme: 'light',
      toggleTheme: vi.fn(),
    };

    renderWithThemeContext(mockThemeContext);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });

  it('displays moon icon for light theme', () => {
    const mockThemeContext = {
      theme: 'light',
      toggleTheme: vi.fn(),
    };

    renderWithThemeContext(mockThemeContext);

    const moonIcon = screen.getByTestId('moon-icon');
    expect(moonIcon).toBeInTheDocument();
    expect(moonIcon).toHaveTextContent('Moon');
  });

  it('displays sun icon for dark theme', () => {
    const mockThemeContext = {
      theme: 'dark',
      toggleTheme: vi.fn(),
    };

    renderWithThemeContext(mockThemeContext);

    const sunIcon = screen.getByTestId('sun-icon');
    expect(sunIcon).toBeInTheDocument();
    expect(sunIcon).toHaveTextContent('Sun');
  });

  it('calls toggleTheme when clicked', async () => {
    const user = userEvent.setup();
    const mockToggleTheme = vi.fn();
    const mockThemeContext = {
      theme: 'light',
      toggleTheme: mockToggleTheme,
    };

    renderWithThemeContext(mockThemeContext);

    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);

    expect(mockToggleTheme).toHaveBeenCalledOnce();
  });

  it('has correct title attribute', () => {
    const mockThemeContext = {
      theme: 'light',
      toggleTheme: vi.fn(),
    };

    renderWithThemeContext(mockThemeContext);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAttribute('title', 'Switch to Dark Mode');
  });

  it('has correct title for dark theme', () => {
    const mockThemeContext = {
      theme: 'dark',
      toggleTheme: vi.fn(),
    };

    renderWithThemeContext(mockThemeContext);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAttribute('title', 'Switch to Light Mode');
  });
});
