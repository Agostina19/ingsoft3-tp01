import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy de desarrollo: todo lo que el front pida a /api lo reenvía Vite
    // al backend en localhost:8080. Así el código llama a rutas relativas
    // (/api/gastos) y NO tiene el host del backend escrito en ningún lado.
    // En producción, este mismo reenvío lo hace nginx (frontend/nginx.conf).
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
