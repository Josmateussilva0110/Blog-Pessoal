import { getApiBaseUrl } from "./apiBaseUrl";
import { authService } from "./auth.service";
import { tryRefreshSession } from "@/features/auth/lib/refreshSession";
import { dispatchSessionExpired } from "@/features/auth/lib/sessionEvents";

type MultipartRequestOptions = {
  method: "POST" | "PUT" | "PATCH";
  endpoint: string;
  buildFormData: () => FormData;
};

async function ensureAuthSession(): Promise<boolean> {
  const profile = await authService.me();

  if (profile.success) {
    return true;
  }

  return tryRefreshSession();
}

export async function fetchMultipartWithAuth({
  method,
  endpoint,
  buildFormData,
}: MultipartRequestOptions): Promise<Response> {
  const hasSession = await ensureAuthSession();

  if (!hasSession) {
    dispatchSessionExpired();
    return new Response(
      JSON.stringify({
        success: false,
        message: "Sessão expirada. Faça login novamente.",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const send = () =>
    fetch(`${getApiBaseUrl()}${endpoint}`, {
      method,
      credentials: "include",
      body: buildFormData(),
    });

  let response = await send();

  if (response.status === 401) {
    const refreshed = await tryRefreshSession();

    if (refreshed) {
      response = await send();
    } else {
      dispatchSessionExpired();
    }
  }

  return response;
}
