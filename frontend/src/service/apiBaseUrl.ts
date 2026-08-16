import { env } from "@/config/env";

/** URL base da API (ex: http://localhost:3001/api ou /api no dev com proxy). */
export function getApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    return "/api";
  }

  const base = env.apiUrl.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}
