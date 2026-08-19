import type { ProjectStatus } from "@blog/shared";
import { normalizeProjectStatus } from "@/lib/projectStatus";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Planejado",
  wip: "Em andamento",
  completed: "Concluído",
};

export function getStatusLabel(status: ProjectStatus | string) {
  return STATUS_LABELS[normalizeProjectStatus(status)];
}
