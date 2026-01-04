
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // 讓瀏覽器端可以直接讀取到 API_KEY 與 GOOGLE_CLIENT_ID
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env.GOOGLE_CLIENT_ID': JSON.stringify(process.env.GOOGLE_CLIENT_ID || '784969429141-8k4q79j93u97vj4j90161a039q2788e0.apps.googleusercontent.com'),
    'process.env': process.env
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false
  }
})
