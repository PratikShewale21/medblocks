import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), svgr()],
  // 1. Change the sourcemap style to avoid 'eval'
  builder: {
    sourcemap: 'inline'
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  // 2. Add this for dev mode
  core: {
    builder: 'webpack' // Ignore if this causes an error, use below instead
  },
  // Use this specifically to bypass CSP in dev
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: false // Disables the red error overlay that uses eval
    }
  }
});