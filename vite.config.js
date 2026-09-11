import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/fake-job-detection/',
  server: {
    host: true,
    port: 3000,
    strictPort: false
  }
})