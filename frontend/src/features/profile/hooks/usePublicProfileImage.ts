import { useQuery } from "@tanstack/react-query";
import { DEFAULT_IMAGE_FALLBACK } from "@/components/ui/Image";
import type { ProfileImageMeta } from "@/lib/profileImageUrl";
import { getPublicProfileImageMeta } from "@/service/profile.service";

export const profileKeys = {
  all: ["profile"] as const,
  publicImage: () => [...profileKeys.all, "public-image"] as const,
};

const EMPTY_META: ProfileImageMeta = { updated_at: null, image_url: null };

async function fetchProfileImageMeta(): Promise<ProfileImageMeta> {
  const result = await getPublicProfileImageMeta();
  // Sem foto ou com a API fora, a hero mostra a imagem padrão (não é informação falsa)
  return result.success ? result.data : EMPTY_META;
}

export function usePublicProfileImage() {
  return useQuery({
    queryKey: profileKeys.publicImage(),
    queryFn: fetchProfileImageMeta,
    select: (meta) => ({
      meta,
      url: meta.thumbnail_url ?? meta.image_url ?? DEFAULT_IMAGE_FALLBACK,
      fullUrl: meta.image_url ?? DEFAULT_IMAGE_FALLBACK,
      hasImage: meta.image_url !== null,
    }),
  });
}
