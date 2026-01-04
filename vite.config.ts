
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // 確保 process.env.API_KEY 在編譯時會被替換
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env': process.env
  }
})
