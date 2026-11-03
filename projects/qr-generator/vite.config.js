import { defineConfig } from 'vite';

export default defineConfig({
  // Rutas relativas para que funcione tanto en la raíz como bajo /<repo>/ en Pages.
  base: './',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
