import { getApiBaseUrl } from "./apiBaseUrl";
import type { ApiResponse } from "./types";
import { tryRefreshSession } from "@/features/auth/lib/refreshSession";
import { dispatchSessionExpired, dispatchPasswordChangeRequired } from "@/features/auth/lib/sessionEvents";

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
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

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
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
  const { method = "GET", body, params, signal, skipAuthRefresh = false } =
    options;

  try {
    const response = await fetch(buildUrl(endpoint, params), {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
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

    return parseResponse<T>(response);
  } catch {
    return {
      success: false,
      message: "Não foi possível conectar ao servidor. Tente novamente.",
    };
  }
}
