import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import path from 'path';
// @ts-ignore
import eslint from 'vite-plugin-eslint';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    eslint({
      failOnError: false, // 開発中はエラーがあってもビルドを続行
      failOnWarning: false,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
  },
})
