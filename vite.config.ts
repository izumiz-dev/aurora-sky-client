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
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 開発環境用
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com http://fonts.googleapis.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://bsky.social https://*.bsky.social https://*.bsky.network https://cdn.bsky.app wss://bsky.social wss://*.bsky.social wss://*.bsky.network http://localhost:* https://localhost:* ws://localhost:* wss://localhost:* https://aurora.izumiz.dev",
        "font-src 'self' https://fonts.gstatic.com http://fonts.gstatic.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "frame-src https://www.youtube.com https://youtube.com",
        "media-src 'self' https:",
      ].join('; '),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer-when-downgrade',
    },
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
  },
})
