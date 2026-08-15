import type { ReactNode } from "react";

interface SectionHeaderProps {
  /** Small uppercase label above the title */
  tag?: string;
  /** Main heading text */
  title: string;
  /** Optional description below the title */
  subtitle?: string;
  /** Optional trailing element (e.g. a badge or counter) */
  trailing?: ReactNode;
}

export function SectionHeader({
  tag,
  title,
  subtitle,
  trailing,
}: SectionHeaderProps) {
  return (
    <header className="mb-8 flex items-end justify-between gap-4">
      <div className="max-w-lg">
        {tag && (
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent/70 mb-2">
            {tag}
          </p>
        )}
        <h2 className="text-2xl font-bold text-text tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </header>
  );
}
