import { env } from "@/config/env";

/** URL base da API (ex: http://localhost:3000/api). */
export function getApiBaseUrl(): string {
  const base = env.apiUrl.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}
