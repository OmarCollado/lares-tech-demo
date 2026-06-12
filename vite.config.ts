import { defineConfig } from 'vite';

export default defineConfig({
  // Rutas relativas: el build funciona servido desde cualquier subcarpeta
  // (GitHub Pages, Hostinger, file://) sin tocar configuración.
  base: './',
  build: {
    target: 'es2022',
    // Un solo chunk: la app es pequeña y el waterfall de módulos no compensa.
    rollupOptions: {
      output: { manualChunks: undefined },
    },
  },
  server: {
    port: 5173,
  },
});
