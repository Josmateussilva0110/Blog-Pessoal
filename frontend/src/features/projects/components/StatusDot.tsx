import type { ProjectStatus } from "@blog/shared";
import { STATUS_DOT_CLASS } from "@/features/projects/lib/statusDot";
import { cn } from "@/lib/format";

/** Ponto colorido que indica o status do projeto (decorativo: o rótulo vem ao lado) */
export function StatusDot({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span
      className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT_CLASS[status], className)}
      aria-hidden
    />
  );
}
