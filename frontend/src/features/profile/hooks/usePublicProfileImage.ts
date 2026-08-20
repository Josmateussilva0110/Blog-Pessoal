import { useQuery } from "@tanstack/react-query";
import { getApiBaseUrl } from "@/service/apiBaseUrl";
import { DEFAULT_IMAGE_FALLBACK } from "@/components/ui/Image";
import type { ProfileImageMeta } from "@/lib/profileImageUrl";

async function fetchProfileImageMeta(): Promise<ProfileImageMeta> {
  const response = await fetch(`${getApiBaseUrl()}/public/profile-image/meta`);

  if (!response.ok) {
    return { updated_at: null, image_url: null };
  }

  const payload = (await response.json()) as {
    success: boolean;
    data?: ProfileImageMeta;
  };

  return payload.data ?? { updated_at: null, image_url: null };
}

export function usePublicProfileImage() {
  return useQuery({
    queryKey: ["public-profile-image"],
    queryFn: fetchProfileImageMeta,
    staleTime: 1000 * 60 * 5,
    select: (meta) => ({
      meta,
      url: meta.thumbnail_url ?? meta.image_url ?? DEFAULT_IMAGE_FALLBACK,
      fullUrl: meta.image_url ?? DEFAULT_IMAGE_FALLBACK,
      hasImage: meta.image_url !== null,
    }),
  });
}
