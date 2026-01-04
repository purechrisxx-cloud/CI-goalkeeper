
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // 讓瀏覽器端可以直接讀取到 API_KEY
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env': process.env
  },
  build: {
    // 優化生產環境打包
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false
  }
})
