import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // Expose on 0.0.0.0 — accessible from phone on same Wi-Fi
    port: 5173,
  }
})
