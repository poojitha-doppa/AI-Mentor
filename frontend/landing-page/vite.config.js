import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: false, // Don't copy static files, serve HTML from root
  server: {
    port: 4173,
    host: 'localhost',
    open: false,  // Disabled auto-open to prevent continuous reopening
    strictPort: false,
    hmr: {
      host: 'localhost',
      port: 4173
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    strictPort: false,
    allowedHosts: [
      'careersync-landing-oldo.onrender.com',
      '.onrender.com'
    ]
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
        auth: './auth.html',
        profile: './profile.html',
        'reset-password': './reset-password.html',
        'verify-otp': './verify-otp.html'
      }
    }
  }
})
