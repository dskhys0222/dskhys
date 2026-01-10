import { fileURLToPath, URL } from 'node:url';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        devtools(),
        tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
            routeFileIgnorePattern: 'styles\\.ts$',
        }),
        viteReact({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true,
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
            },
            manifest: {
                name: 'Portfolio',
                short_name: 'Portfolio',
                description: '株式ポートフォリオ管理アプリケーション',
                theme_color: '#1a472a',
                background_color: '#ffffff',
                display: 'standalone',
                icons: [
                    {
                        src: 'logo192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'logo512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'logo512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: 'logo512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
            },
        }),
        basicSsl(),
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
