import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

function loadProjectEnv(mode: string) {
  const monorepoRoot = path.resolve(__dirname, "..");
  const frontendRoot = __dirname;

  return {
    ...loadEnv(mode, monorepoRoot, ""),
    ...loadEnv(mode, frontendRoot, ""),
  };
}

function resolveNodeEnv(mode: string, env: Record<string, string>) {
  if (env.NODE_ENV === "production" || env.NODE_ENV === "development") {
    return env.NODE_ENV;
  }

  return mode === "production" ? "production" : "development";
}

function requireApiUrl(env: Record<string, string>, nodeEnv: string): string {
  const apiUrl = env.VITE_API_URL?.trim();

  if (!apiUrl) {
    throw new Error(
      `VITE_API_URL é obrigatória (NODE_ENV=${nodeEnv}). Defina no .env da raiz, em frontend/.env.${nodeEnv} ou no painel do deploy.`,
    );
  }

  return apiUrl.replace(/\/$/, "");
}

export default defineConfig(({ mode }) => {
  const env = loadProjectEnv(mode);
  const nodeEnv = resolveNodeEnv(mode, env);
  const apiUrl = requireApiUrl(env, nodeEnv);
  const proxyTarget = apiUrl.replace(/\/api$/, "");

  return {
    plugins: [react(), tailwindcss()],
    envDir: path.resolve(__dirname, ".."),
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
          target: proxyTarget,
          changeOrigin: true,
          secure: proxyTarget.startsWith("https://"),
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
  };
});
