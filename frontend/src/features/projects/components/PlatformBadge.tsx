import type { ProjectPlatform } from "@blog/shared";
import { Badge } from "@/components/ui/Badge";
import { normalizeProjectPlatform, PLATFORM_LABELS } from "@/lib/projectPlatform";

/** Plataforma é categoria, não estado: badge neutro (as cores ficam para o status) */
export function PlatformBadge({ platform }: { platform: ProjectPlatform | string }) {
  return <Badge>{PLATFORM_LABELS[normalizeProjectPlatform(platform)]}</Badge>;
}
