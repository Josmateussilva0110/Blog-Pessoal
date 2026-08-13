import type { ProjectStatus } from "@blog/shared";
import { Badge } from "@/components/ui/Badge";
import { getStatusLabel } from "@/lib/utils";

const statusVariant: Record<
  ProjectStatus,
  "success" | "warning" | "muted"
> = {
  active: "success",
  wip: "warning",
  archived: "muted",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant={statusVariant[status]}>{getStatusLabel(status)}</Badge>
  );
}
