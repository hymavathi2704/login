// Frontend/vite.config.mjs
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
  },
  plugins: [react(), tsconfigPaths(), tagger()],
  server: {
  port: 5173,
  host: "0.0.0.0",
  strictPort: true,
  allowedHosts: ['.amazonaws.com', '.builtwithrocket.new'],
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
  historyApiFallback: true,  // ✅ simpler and correct
},

  resolve: {
    alias: {
      "components": path.resolve(__dirname, './src/components'),
      "pages": path.resolve(__dirname, './src/pages'),
      "auth": path.resolve(__dirname, './src/auth'),
    },
  },
});