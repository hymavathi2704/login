// vite.config.mjs
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // 1. Load all environment variables from the .env file associated with the mode
  const env = loadEnv(mode, process.cwd(), '');

  // 2. Define the correct backend URL. 
  // It checks for the explicit environment variable first, then uses the value from the loaded .env file.
  // It only falls back to localhost:4028 if everything else fails.
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:4028';

  return {
    // This is necessary for correct path resolution in the deployed app.
    base: '/', 
    
    // 🔑 CRITICAL FIX: Inject the determined URL directly into the bundle
    define: {
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(backendUrl),
    },

    build: {
      outDir: "build",
      chunkSizeWarningLimit: 2000,
    },

    plugins: [react(), tsconfigPaths()], 
    
    server: {
      port: 5173,
      host: "0.0.0.0",
      strictPort: true,
      allowedHosts: ['.amazonaws.com'], 
      
      // Proxy remains for local development use only
      proxy: {
        "/api": {
          target: "http://localhost:4028", 
          changeOrigin: true,
        },
      },
      fs: {
        strict: false,
      },
      hmr: true,
      historyApiFallback: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});