import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            exclude: [
                'src/index.ts', // アプリケーション起動ファイルは除外
                '**/*.test.ts',
                '**/__mocks__/**',
                '**/*.config.*',
                'node_modules/**',
            ],
            reporter: ['text', 'json', 'html'],
            thresholds: {
                branches: 88,
                functions: 97,
                lines: 92,
                statements: 92,
            },
        },
        env: {
            NODE_ENV: 'test',
        },
        environment: 'node',
        globals: true,
        include: ['src/**/*.test.ts'],
    },
});
