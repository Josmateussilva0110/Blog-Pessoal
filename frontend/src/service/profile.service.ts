import { getApiBaseUrl } from "./apiBaseUrl";
import type { ApiResponse, UserProfile } from "./types";
import { tryRefreshSession } from "@/features/auth/lib/refreshSession";
import { dispatchSessionExpired } from "@/features/auth/lib/sessionEvents";

async function parseJsonResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | { message?: string; code?: string }
    | null;

  if (!response.ok) {
    const errorBody = payload && "message" in payload ? payload : undefined;

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

async function refreshSessionIfNeeded(
  response: Response,
  endpoint: string,
  skipAuthRefresh: boolean,
): Promise<boolean> {
  if (
    response.status !== 401 ||
    skipAuthRefresh ||
    endpoint.startsWith("/auth/refresh")
  ) {
    return false;
  }

  const refreshed = await tryRefreshSession();

  if (!refreshed) {
    dispatchSessionExpired();
  }

  return refreshed;
}

export async function uploadProfileImage(
  file: File,
): Promise<ApiResponse<UserProfile>> {
  const endpoint = "/profile/image";

  const send = async () => {
    const formData = new FormData();
    formData.append("image", file);

    return fetch(`${getApiBaseUrl()}${endpoint}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });
  };

  let response = await send();

  if (await refreshSessionIfNeeded(response, endpoint, false)) {
    response = await send();
  }

  return parseJsonResponse<UserProfile>(response);
}

export async function deleteProfileImage(): Promise<ApiResponse<UserProfile>> {
  const endpoint = "/profile/image";

  const send = async () => {
    return fetch(`${getApiBaseUrl()}${endpoint}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  let response = await send();

  if (await refreshSessionIfNeeded(response, endpoint, false)) {
    response = await send();
  }

  return parseJsonResponse<UserProfile>(response);
}
