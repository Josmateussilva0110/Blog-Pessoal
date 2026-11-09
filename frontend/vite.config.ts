import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { API_ENDPOINTS } from "./src/config/apiEndpoints";

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

/** Endpoints que a home busca ao abrir (foto do hero e projetos) */
const HOME_PRELOAD_PATHS = [API_ENDPOINTS.publicProfileImageMeta, API_ENDPOINTS.projectsHome];

/**
 * Na home, começa a buscar os dados do hero e dos projetos junto com o JS, em vez de
 * esperar o app montar (cascata HTML → JS → API → imagem atrasava o LCP). Script inline:
 * só a home precisa desses dados. crossorigin use-credentials casa com o
 * credentials: "include" do client.ts, senão o navegador baixaria de novo.
 */
function preloadHomeData(apiBase: string): Plugin {
  const urls = JSON.stringify(HOME_PRELOAD_PATHS.map((endpoint) => `${apiBase}${endpoint}`));

  return {
    name: "preload-home-data",
    transformIndexHtml() {
      return [
        {
          tag: "script",
          injectTo: "head",
          children: `if (location.pathname === "/") for (const href of ${urls}) { const link = document.createElement("link"); link.rel = "preload"; link.as = "fetch"; link.crossOrigin = "use-credentials"; link.href = href; document.head.appendChild(link); }`,
        },
      ];
    },
  };
}

/** Mesma regra do getApiBaseUrl: proxy /api no dev, URL absoluta terminada em /api no build */
function resolveClientApiBase(command: "build" | "serve", apiUrl: string) {
  if (command === "serve") return "/api";
  return apiUrl.endsWith("/api") ? apiUrl : `${apiUrl}/api`;
}

export default defineConfig(({ command, mode }) => {
  const env = loadProjectEnv(mode);
  const nodeEnv = resolveNodeEnv(mode, env);
  const apiUrl = requireApiUrl(env, nodeEnv);
  const proxyTarget = apiUrl.replace(/\/api$/, "");

  return {
    plugins: [react(), tailwindcss(), preloadHomeData(resolveClientApiBase(command, apiUrl))],
    envDir: path.resolve(__dirname, ".."),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Antes do alias raiz (o primeiro que casa vence): constantes sem puxar
        // os schemas/zod para o bundle inicial
        "@blog/shared/constants": path.resolve(__dirname, "../packages/shared/src/constants/index.ts"),
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
