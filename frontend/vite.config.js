// comments in English only
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // 0.0.0.0 => accessible from LAN
    port: 5173, // or preferred port
    strictPort: true,
    // HMR tweaks help when opening from a phone
    hmr: {
      host: '192.168.100.2', // LAN IPv4
      protocol: 'ws',
      port: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // keep localhost because proxy runs on PC
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
