import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    port: 5173,
    open: false,  // Disabled auto-open - user clicks from home page instead
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false,
    allowedHosts: [
      'careersync-roadmap-oldo.onrender.com',
      '.onrender.com'
    ]
  },
})
