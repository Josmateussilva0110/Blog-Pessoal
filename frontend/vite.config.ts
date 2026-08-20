import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@blog/shared": path.resolve(__dirname, "../packages/shared/src/index.ts"),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes) => {
            const setCookie = proxyRes.headers["set-cookie"];

            if (!setCookie) return;

            proxyRes.headers["set-cookie"] = setCookie.map((cookie) =>
              cookie
                .replace(/; Secure/gi, "")
                .replace(/; Domain=[^;]+/gi, ""),
            );
          });
        },
      },
    },
  },
});
