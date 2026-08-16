import { authService } from "@/service";
import type { AuthUser } from "@/service";
import { mapAuthUser } from "./mapAuthUser";

export async function restoreSession(): Promise<AuthUser | null> {
  const refreshResult = await authService.refresh();

  if (refreshResult.success) {
    return mapAuthUser(refreshResult.data.user);
  }

  const profileResult = await authService.me({ skipAuthRefresh: true });

  if (profileResult.success) {
    return mapAuthUser(profileResult.data);
  }

  return null;
}
