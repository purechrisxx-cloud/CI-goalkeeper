
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // 將系統環境變數注入到前端程式碼中
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env.GOOGLE_CLIENT_ID': JSON.stringify(process.env.GOOGLE_CLIENT_ID || ''),
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false
  }
})
