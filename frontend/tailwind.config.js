/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'primary': '#1E40AF', // Deep blue (primary) - blue-800
        'primary-50': '#EFF6FF', // Very light blue - blue-50
        'primary-100': '#DBEAFE', // Light blue - blue-100
        'primary-500': '#3B82F6', // Medium blue - blue-500
        'primary-600': '#2563EB', // Darker blue - blue-600
        'primary-700': '#1D4ED8', // Dark blue - blue-700
        
        // Secondary Colors
        'secondary': '#6366F1', // Vibrant indigo (secondary) - indigo-500
        'secondary-50': '#EEF2FF', // Very light indigo - indigo-50
        'secondary-100': '#E0E7FF', // Light indigo - indigo-100
        'secondary-600': '#5B21B6', // Darker indigo - indigo-600
        'secondary-700': '#4C1D95', // Dark indigo - indigo-700
        
        // Accent Colors
        'accent': '#F59E0B', // Warm amber (accent) - amber-500
        'accent-50': '#FFFBEB', // Very light amber - amber-50
        'accent-100': '#FEF3C7', // Light amber - amber-100
        'accent-600': '#D97706', // Darker amber - amber-600
        'accent-700': '#B45309', // Dark amber - amber-700
        
        // Background Colors
        'background': {
          DEFAULT: '#FAFBFC', // Light mode background
          dark: '#1A202C',    // Dark mode background
        },
        'surface': {
          DEFAULT: '#FFFFFF', // Light mode surface
          dark: '#2D3748',    // Dark mode surface
        },
        'surface-hover': {
          DEFAULT: '#F9FAFB', // Light mode surface hover
          dark: '#4A5568',    // Dark mode surface hover
        },
        
        // Text Colors
        'text-primary': {
          DEFAULT: '#1F2937', // Light mode text primary
          dark: '#F7FAFC',    // Dark mode text primary
        },
        'text-secondary': {
          DEFAULT: '#6B7280', // Light mode text secondary
          dark: '#E2E8F0',    // Dark mode text secondary
        },
        'text-tertiary': {
          DEFAULT: '#9CA3AF', // Light mode text tertiary
          dark: '#A0AEC0',    // Dark mode text tertiary
        },
        'text-inverse': {
          DEFAULT: '#FFFFFF', // Light mode text inverse
          dark: '#1F2937',    // Dark mode text inverse
        },
        
        // Status Colors
        'success': '#10B981', // Fresh green (success) - emerald-500
        'success-50': '#ECFDF5', // Very light green - emerald-50
        'success-100': '#D1FAE5', // Light green - emerald-100
        'success-600': '#059669', // Darker green - emerald-600
        
        'warning': '#F59E0B', // Amber warning (same as accent) - amber-500
        'warning-50': '#FFFBEB', // Very light amber - amber-50
        'warning-100': '#FEF3C7', // Light amber - amber-100
        'warning-600': '#D97706', // Darker amber - amber-600
        
        'error': '#EF4444', // Clear red (error) - red-500
        'error-50': '#FEF2F2', // Very light red - red-50
        'error-100': '#FEE2E2', // Light red - red-100
        'error-600': '#DC2626', // Darker red - red-600
        
        // Border Colors
        'border': '#E5E7EB', // Light gray border - gray-200
        'border-light': '#F3F4F6', // Very light gray border - gray-100
        'border-dark': '#D1D5DB', // Medium gray border - gray-300
      },
      fontFamily: {
        'heading': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'caption': ['Inter', 'system-ui', 'sans-serif'],
        'data': ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '300': '300ms',
      },
      zIndex: {
        '1000': '1000',
        '1100': '1100',
        '1200': '1200',
        '1300': '1300',
      },
    },
  },
  plugins: [],
}