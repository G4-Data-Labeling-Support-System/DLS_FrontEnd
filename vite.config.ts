import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/api': path.resolve(__dirname, './src/api'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/routes': path.resolve(__dirname, './src/routes'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/components': path.resolve(__dirname, './src/components')
    }
  },
  // --- CẤU HÌNH PROXY ĐỂ SỬA LỖI CORS ---
  server: {
    proxy: {
      '/api': {
        target: 'https://dls-beta.hikarimoon.pro', // Server backend base URL
        changeOrigin: true,
        secure: false
        // Nếu backend của bạn đường dẫn là /api/v1, thì giữ nguyên.
        // Nếu backend không có prefix /api mà bạn thêm vào ở frontend, dùng rewrite bên dưới:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})
