import type { ProjectStatus } from "@blog/shared";

const LEGACY_COMPLETED_STATUSES = new Set(["archived", "closed"]);
const LEGACY_PLANNED_STATUSES = new Set(["active"]);

export function normalizeProjectStatus(status: string): ProjectStatus {
  if (LEGACY_COMPLETED_STATUSES.has(status)) {
    return "completed";
  }

  if (LEGACY_PLANNED_STATUSES.has(status)) {
    return "planned";
  }

  if (status === "planned" || status === "wip" || status === "completed") {
    return status;
  }

  return "planned";
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Planejado",
  wip: "Em andamento",
  completed: "Concluído",
};

export function getStatusLabel(status: ProjectStatus | string) {
  return STATUS_LABELS[normalizeProjectStatus(status)];
}
