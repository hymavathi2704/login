// vite.config.mjs
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // ✅ FIX FOR PRODUCTION BUILD PATHS (index.html issue):
  // Ensures all asset paths in the final build are relative, preventing issues when deploying
  // to a non-root path or for simple static hosting.
  base: './', 
  
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
  },
  // ✅ DHIWISE REMOVAL: Removed the 'tagger()' plugin call
  plugins: [react(), tsconfigPaths()], 
  server: {
    port: 5173,
    host: "0.0.0.0",
    strictPort: true,
    // Allowed Hosts cleaned up, removing the DhiWise-specific reference
    allowedHosts: ['.amazonaws.com'], 
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
});