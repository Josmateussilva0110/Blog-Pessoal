import type { ProjectPlatform } from "@blog/shared";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/format";
import { PLATFORM_LABELS } from "@/lib/projectPlatform";
import { normalizeProjectPlatform } from "@/lib/projectPlatform";

const platformVariant: Record<ProjectPlatform, "accent" | "success"> = {
  mobile: "accent",
  web: "success",
};

const platformCardStyles: Record<ProjectPlatform, string> = {
  mobile:
    "text-sky-100 bg-sky-500/30 border-sky-300/55 shadow-sm shadow-sky-500/25 ring-1 ring-sky-400/25",
  web:
    "text-emerald-100 bg-emerald-500/30 border-emerald-300/55 shadow-sm shadow-emerald-500/25 ring-1 ring-emerald-400/25",
};

export function PlatformBadge({ platform }: { platform: ProjectPlatform | string }) {
  const normalized = normalizeProjectPlatform(platform);

  return (
    <Badge variant={platformVariant[normalized]}>
      {PLATFORM_LABELS[normalized]}
    </Badge>
  );
}

export function PlatformCardLabel({ platform }: { platform: ProjectPlatform | string }) {
  const normalized = normalizeProjectPlatform(platform);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide",
        platformCardStyles[normalized],
      )}
    >
      {PLATFORM_LABELS[normalized]}
    </span>
  );
}
