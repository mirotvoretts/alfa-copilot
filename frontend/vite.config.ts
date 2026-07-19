import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      app: '/src/app',
      pages: '/src/pages',
      widgets: '/src/widgets',
      features: '/src/features',
      entities: '/src/entities',
      shared: '/src/shared',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
