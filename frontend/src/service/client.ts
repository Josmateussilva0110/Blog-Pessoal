import { getApiBaseUrl } from "./apiBaseUrl";
import type { ApiResponse } from "./types";

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

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("accessToken");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", body, params, signal } = options;

  try {
    const response = await fetch(buildUrl(endpoint, params), {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });

    const payload = (await response.json().catch(() => null)) as
      | ApiResponse<T>
      | { message?: string; code?: string }
      | null;

    if (!response.ok) {
      if (response.status === 401) {
        window.dispatchEvent(new Event("SESSION_EXPIRED"));
      }

      const errorBody =
        payload && "message" in payload ? payload : undefined;

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
  } catch {
    return {
      success: false,
      message: "Não foi possível conectar ao servidor. Tente novamente.",
    };
  }
}
