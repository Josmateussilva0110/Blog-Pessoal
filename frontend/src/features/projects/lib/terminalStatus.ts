import type { ProjectStatus } from "@blog/shared";

export const TERMINAL_STATUS: Record<
  ProjectStatus,
  { label: string; short: string; icon: string; className: string; stripe: string }
> = {
  planned: {
    label: "PLANEJADO",
    short: "planned",
    icon: "▲",
    className: "text-amber-400",
    stripe: "bg-amber-400",
  },
  wip: {
    label: "EM ANDAMENTO",
    short: "wip",
    icon: "●",
    className: "text-terminal",
    stripe: "bg-terminal",
  },
  completed: {
    label: "CONCLUÍDO",
    short: "done",
    icon: "✓",
    className: "text-accent",
    stripe: "bg-accent",
  },
};
