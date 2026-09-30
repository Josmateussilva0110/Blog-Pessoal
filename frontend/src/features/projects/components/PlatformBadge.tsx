import type { ProjectPlatform } from "@blog/shared";
import { Badge } from "@/components/ui/Badge";
import { PLATFORM_LABELS } from "@/lib/projectPlatform";
import { normalizeProjectPlatform } from "@/lib/projectPlatform";

const platformVariant: Record<ProjectPlatform, "accent" | "success"> = {
  mobile: "accent",
  web: "success",
};

export function PlatformBadge({ platform }: { platform: ProjectPlatform | string }) {
  const normalized = normalizeProjectPlatform(platform);

  return (
    <Badge variant={platformVariant[normalized]}>
      {PLATFORM_LABELS[normalized]}
    </Badge>
  );
}
