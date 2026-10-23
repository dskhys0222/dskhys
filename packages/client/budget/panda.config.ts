import { defineConfig } from '@pandacss/dev';

export default defineConfig({
    presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
    shorthands: false,
    preflight: true,
    jsxFramework: 'react',
    include: ['./src/**/*.{ts,tsx}'],
    exclude: [],
    outdir: 'styled-system',
});
