import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "connect-src 'self' http://localhost:8000 https://*.app.github.dev",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join('; ')

const securityHeaders = {
  'Content-Security-Policy': contentSecurityPolicy,
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/bootstrap')) {
            return 'bootstrap'
          }

          if (id.includes('node_modules/react')) {
            return 'react'
          }
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    headers: securityHeaders,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    headers: securityHeaders,
  },
})
