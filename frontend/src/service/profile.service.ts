import type { ProfileImageMeta } from "@/lib/profileImageUrl";
import { parseJsonResponse, request } from "./client";
import { fetchMultipartWithAuth } from "./fetchMultipart";
import type { ApiResponse, UserProfile } from "./types";

export async function uploadProfileImage(file: File): Promise<ApiResponse<UserProfile>> {
  const response = await fetchMultipartWithAuth({
    method: "PUT",
    endpoint: "/profile/image",
    buildFormData: () => {
      const formData = new FormData();
      formData.append("image", file);
      return formData;
    },
  });

  return parseJsonResponse<UserProfile>(response);
}

export function deleteProfileImage() {
  return request<UserProfile>("/profile/image", { method: "DELETE" });
}

/** Rota pública: sem renovar sessão em 401 */
export function getPublicProfileImageMeta() {
  return request<ProfileImageMeta>("/public/profile-image/meta", { skipAuthRefresh: true });
}
