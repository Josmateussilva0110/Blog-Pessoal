import type { ReactNode } from "react";

/** Chip de tecnologia usado nos cards e na página do projeto */
export function TechChip({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-full border border-hairline bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-text-muted">
      {children}
    </li>
  );
}
