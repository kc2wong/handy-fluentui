import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.lib.json',
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        '@fluentui/react-components',
        '@fluentui/react-datepicker-compat',
        '@fluentui/react-calendar-compat',
        '@fluentui/react-icons',
        'usehooks-ts',
      ],
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: false,
  },
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
