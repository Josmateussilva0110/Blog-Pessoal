import type { ProjectStatus } from "@blog/shared";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Ativo",
  wip: "Em progresso",
  archived: "Arquivado",
};

export function getStatusLabel(status: ProjectStatus) {
  return STATUS_LABELS[status];
}
