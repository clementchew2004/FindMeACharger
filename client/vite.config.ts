import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "src/tests/setupTests.ts", // we’ll create this next
    include: ["src/tests/**/*.test.{ts,tsx}"], // where tests live
  },
})
