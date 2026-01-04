
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // 安全地僅映射需要的變數，不洩漏整個 process.env
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env.GOOGLE_CLIENT_ID': JSON.stringify(process.env.GOOGLE_CLIENT_ID || ''),
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false
  }
})
