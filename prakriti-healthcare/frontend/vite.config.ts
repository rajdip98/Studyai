import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // In local dev, proxy API calls to the backend to keep everything on
      // one origin so cookies (SameSite=strict) work without extra config.
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      // Locally-stored uploads (admin banners/posters/payment QR/product
      // images) are served by the backend when S3 isn't configured.
      "/uploads": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/setup.ts",
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
});
