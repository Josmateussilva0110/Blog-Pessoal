import type { ProjectStatus } from "@blog/shared";

const LEGACY_COMPLETED_STATUSES = new Set(["archived", "closed"]);

export function normalizeProjectStatus(status: string): ProjectStatus {
  if (LEGACY_COMPLETED_STATUSES.has(status)) {
    return "completed";
  }

  if (status === "active" || status === "wip" || status === "completed") {
    return status;
  }

  return "wip";
}

export type ProjectFormStatus = "wip" | "completed";

export function toFormProjectStatus(status: string): ProjectFormStatus {
  return normalizeProjectStatus(status) === "completed" ? "completed" : "wip";
}
