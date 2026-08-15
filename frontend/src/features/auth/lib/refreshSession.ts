import { authService } from "@/service/auth.service";

let refreshPromise: Promise<boolean> | null = null;

export async function tryRefreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const result = await authService.refresh();
    return result.success;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}
