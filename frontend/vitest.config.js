import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    css: true,
    // Explicit include patterns for better UI discovery
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/**/__tests__/**/*.{js,jsx,ts,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,playwright}.config.*',
      // Exclude integration tests from default runs
      '**/*.contract.test.{js,jsx}',
      '**/*.integration.test.{js,jsx}'
    ],
    // UI-specific settings for better discovery
    ui: {
      open: false,
      port: 51204
    },
    // Force file watching for better discovery
    watchExclude: [
      '**/node_modules/**', 
      '**/dist/**',
      '**/build/**'
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}',
        'build/',
        'dist/',
        'public/',
        'server/',
        'supabase/',
        'e2e/',
        '*.config.js',
        '*.config.mjs'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});

// Export separate config for integration tests
export const integrationConfig = defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js', './src/test/integrationSetup.js'],
    globals: true,
    css: true,
    include: [
      '**/*.contract.test.{js,jsx}',
      '**/*.integration.test.{js,jsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
