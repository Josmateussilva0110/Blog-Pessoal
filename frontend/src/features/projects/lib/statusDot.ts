import type { ProjectStatus } from "@blog/shared";

/** Cor do ponto de status; o rótulo vem de getStatusLabel (fonte única) */
export const STATUS_DOT_CLASS: Record<ProjectStatus, string> = {
  planned: "bg-warning",
  wip: "bg-terminal",
  completed: "bg-accent",
};
