import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js', './src/test/integrationSetup.js'],
    globals: true,
    css: true,
    include: [
      // Include all test files (unit and integration)
      '**/*.{test,spec}.?(c|m)[jt]s?(x)',
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
    // Configure coverage if needed
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/e2e/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
