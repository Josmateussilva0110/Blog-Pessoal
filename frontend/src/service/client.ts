import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE } from "@blog/shared/constants";
import { getApiBaseUrl } from "./apiBaseUrl";
import type { ApiResponse } from "./types";
import { tryRefreshSession } from "@/features/auth/lib/refreshSession";
import { dispatchSessionExpired, dispatchPasswordChangeRequired } from "@/features/auth/lib/sessionEvents";

/** JSON e o header exigido pela API em requisições que alteram dados (CSRF) */
const MUTATION_HEADERS = {
  "Content-Type": "application/json",
  [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE,
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  /** Política de cache HTTP do fetch (ex.: "no-cache" revalida via ETag) */
  cache?: RequestCache;
  /** Evita loop ao renovar sessão ou em rotas públicas de auth. */
  skipAuthRefresh?: boolean;
};

function buildUrl(endpoint: string, params?: RequestOptions["params"]): string {
  const base = getApiBaseUrl();
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${base}${path}`, window.location.origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

/** Converte qualquer resposta da API (JSON, multipart) no formato ApiResponse */
export async function parseJsonResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | { message?: string; code?: string }
    | null;

  if (!response.ok) {
    const errorBody = payload && "message" in payload ? payload : undefined;

    if (response.status === 403 && errorBody?.code === "PASSWORD_CHANGE_REQUIRED") {
      dispatchPasswordChangeRequired();
    }

    return {
      success: false,
      message: errorBody?.message ?? `Erro ${response.status}`,
      code: errorBody?.code,
    };
  }

  if (payload && "success" in payload) {
    return payload as ApiResponse<T>;
  }

  return { success: true, data: payload as T };
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", body, params, signal, cache, skipAuthRefresh = false } =
    options;

  try {
    const response = await fetch(buildUrl(endpoint, params), {
      method,
      credentials: "include",
      // Headers só onde precisa: em GET eles forçariam um preflight em toda leitura pública
      headers: method === "GET" ? undefined : MUTATION_HEADERS,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
      cache,
    });

    if (
      response.status === 401 &&
      !skipAuthRefresh &&
      !endpoint.startsWith("/login") &&
      !endpoint.startsWith("/register") &&
      !endpoint.startsWith("/auth/refresh") &&
      !endpoint.startsWith("/logout")
    ) {
      const refreshed = await tryRefreshSession();

      if (refreshed) {
        return request<T>(endpoint, { ...options, skipAuthRefresh: true });
      }

      dispatchSessionExpired();
    }

    return parseJsonResponse<T>(response);
  } catch {
    return {
      success: false,
      message: "Não foi possível conectar ao servidor. Tente novamente.",
    };
  }
}
