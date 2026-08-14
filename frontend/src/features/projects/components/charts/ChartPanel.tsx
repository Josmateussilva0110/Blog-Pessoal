import { cn } from "@/lib/format";
import type { ReactNode } from "react";

interface ChartPanelProps {
  id?: string;
  label?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

export function ChartPanel({
  id,
  label,
  title,
  subtitle,
  children,
  className,
  compact = false,
}: ChartPanelProps) {
  return (
    <section
      id={id}
      className={cn(compact ? "py-0" : "py-10 md:py-14 scroll-mt-28", className)}
    >
      <header className={cn("mb-5", compact ? "px-1" : "max-w-lg")}>
        {label && (
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent/70 mb-2">
            {label}
          </p>
        )}
        <h3 className="text-lg md:text-xl font-semibold text-text tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </header>

      <div className="glass-strong rounded-3xl overflow-hidden relative">
        <div className="chart-panel-shine" aria-hidden />
        <div className="relative p-5 md:p-7">{children}</div>
      </div>
    </section>
  );
}
