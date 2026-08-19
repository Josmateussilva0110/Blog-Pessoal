import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function TerminalWindowBar({ path }: { path: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle bg-surface-raised">
      <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 shrink-0" />
      <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80 shrink-0" />
      <span className="h-2.5 w-2.5 rounded-full bg-terminal/80 shrink-0" />
      <span className="font-mono text-[11px] ml-2 truncate">
        <span className="text-terminal">mateus@dev</span>
        <span className="text-text-subtle">:</span>
        <span className="text-accent">{path}</span>
      </span>
    </div>
  );
}

interface TerminalWindowProps {
  path: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function TerminalWindow({
  path,
  children,
  className,
  bodyClassName,
}: TerminalWindowProps) {
  return (
    <div className={cn("terminal-card overflow-hidden", className)}>
      <TerminalWindowBar path={path} />
      <div className={cn("p-6 md:p-8", bodyClassName)}>{children}</div>
    </div>
  );
}

interface TerminalPanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function TerminalPanel({ title, children, className }: TerminalPanelProps) {
  return (
    <div className={cn("terminal-card-muted overflow-hidden", className)}>
      {title && (
        <div className="px-4 py-2 border-b border-border-subtle bg-surface-raised/50">
          <p className="font-mono text-[10px] text-text-subtle">{title}</p>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
