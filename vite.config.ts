import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  server: {
    port: 3000,
    host: true,
  },
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@maximilian": path.resolve(__dirname, "./src"),
      "@": path.resolve(__dirname, "./src"),
      "@pagedjs-polyfill":
        path.resolve(__dirname, "./node_modules/pagedjs/dist/paged.polyfill.js") + "?url",
    },
  },

  optimizeDeps: {
    exclude: ["@pagedjs-polyfill"],
  },
});
