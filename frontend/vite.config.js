import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, rootDir, '');
  const localEnv = loadEnv(mode, __dirname, '');
  const env = { ...rootEnv, ...localEnv };
  const apiBase = (env.VITE_API_URL || '').trim();
  const vitePort = Number.parseInt(env.VITE_PORT, 10) || 3000;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx'],
    },
    define: {
      __API_BASE__: JSON.stringify(apiBase),
    },
    envPrefix: 'VITE_',
    server: {
      watch: {
        usePolling: true,
      },
      host: true,
      port: vitePort,
      strictPort: false,
      cors: true,
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5002',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      commonjsOptions: {
        include: [/encrypt-storage/, /node_modules/],
      },
    },
    preview: {
      historyApiFallback: true,
    },
  };
});
