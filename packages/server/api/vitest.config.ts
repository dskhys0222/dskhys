import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        dir: 'src',
        coverage: {
            exclude: ['index.ts'],
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
        include: ['**/*.test.ts'],
    },
});
