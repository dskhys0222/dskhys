import { fileURLToPath, URL } from 'node:url';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        devtools(),
        tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
        }),
        viteReact({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
    ],
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
