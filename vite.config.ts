import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/handy-fluentui/',
  plugins: [react()],
  resolve: {
    alias: {
      '@component': path.resolve(__dirname, 'src/components'),
      '@context': path.resolve(__dirname, 'src/contexts'),
      '@hook': path.resolve(__dirname, 'src/hooks'),
      '@provider': path.resolve(__dirname, 'src/providers'),
      '@util': path.resolve(__dirname, 'src/utils'),
    },
  },
});
