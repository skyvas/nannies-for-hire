import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'e2e/**/*'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
