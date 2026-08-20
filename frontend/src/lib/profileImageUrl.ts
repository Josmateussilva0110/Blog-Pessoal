import { DEFAULT_IMAGE_FALLBACK } from "@/components/ui/Image";

export type ProfileImageMeta = {
  updated_at: string | null;
  image_url: string | null;
  thumbnail_url?: string | null;
};

export function resolveProfileImageUrl(imageUrl?: string | null): string {
  return imageUrl ?? DEFAULT_IMAGE_FALLBACK;
}
