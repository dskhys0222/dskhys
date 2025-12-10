import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'src/index.ts', // アプリケーション起動ファイルは除外
        '**/*.test.ts',
        '**/__mocks__/**',
        '**/*.config.*',
        'node_modules/**',
      ],
      thresholds: {
        lines: 92,
        functions: 97,
        branches: 88,
        statements: 92,
      },
    },
    env: {
      NODE_ENV: 'test',
    },
  },
});
