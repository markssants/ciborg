import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(
        process.env.GEMINI_API_KEY || 
        process.env.ciborg14 || 
        env.GEMINI_API_KEY || 
        env.ciborg14 || 
        env.VITE_GEMINI_API_KEY || 
        env.VITE_CIBORG14 || 
        ""
      ),
      'process.env.ciborg14': JSON.stringify(
        process.env.ciborg14 || 
        env.ciborg14 || 
        env.VITE_CIBORG14 || 
        ""
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
