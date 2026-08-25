import { env } from "@/config/env";

function requireApiUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL?.trim();

  if (!apiUrl) {
    throw new Error(
      "VITE_API_URL não está definida. Configure no .env ou no painel do deploy.",
    );
  }

  return apiUrl;
}

/** URL base da API (`/api` no dev com proxy; URL absoluta em produção). */
export function getApiBaseUrl(): string {
  if (env.isDev) {
    return "/api";
  }

  const base = requireApiUrl().replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}
