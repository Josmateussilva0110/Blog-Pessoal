import type { ProjectStatus } from "@blog/shared";
import { Badge } from "@/components/ui/Badge";
import { getStatusLabel } from "@/lib/utils";
import { normalizeProjectStatus } from "@/lib/projectStatus";

const statusVariant: Record<
  ProjectStatus,
  "success" | "warning" | "accent"
> = {
  active: "accent",
  wip: "warning",
  completed: "success",
};

export function StatusBadge({ status }: { status: ProjectStatus | string }) {
  const normalizedStatus = normalizeProjectStatus(status);

  return (
    <Badge variant={statusVariant[normalizedStatus]}>
      {getStatusLabel(normalizedStatus)}
    </Badge>
  );
}
