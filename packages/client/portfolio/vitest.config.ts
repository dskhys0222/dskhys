import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        include: [
            'src/**/test.tsx',
            'src/**/test.ts',
            'src/**/*.test.tsx',
            'src/**/*.test.ts',
        ],
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
