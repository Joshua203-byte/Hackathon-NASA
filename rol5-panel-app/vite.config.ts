import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// base './' para que funcione bajo /Hackathon-NASA/ en GitHub Pages
export default defineConfig({ base: './', plugins: [react()], test: { include: ['src/**/*.test.ts'] } } as never);
