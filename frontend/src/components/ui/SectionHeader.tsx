import type { ReactNode } from "react";

interface SectionHeaderProps {
  tag?: string;
  title: string;
  subtitle?: string;
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
        {tag && <p className="code-comment mb-2">{"// "}{tag.toLowerCase()}</p>}
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
