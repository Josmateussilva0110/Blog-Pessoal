import type { ReactNode } from "react";
import { SITE } from "@/config/constants";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Card centralizado das telas de login e troca de senha */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-home-bg px-4 py-8 sm:px-6 sm:py-10">
      <div className="w-full max-w-sm">
        <p className="mb-4 text-center font-semibold tracking-[-0.01em] text-home-ink">{SITE.name}</p>

        <div className="rounded-3xl border border-home-line bg-home-card p-6 sm:p-8">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.08em] text-home-muted">Painel admin</p>
          <h1 className="mb-2 text-2xl font-semibold tracking-[-0.03em] text-home-ink">{title}</h1>
          {subtitle && <p className="mb-6 text-sm leading-relaxed text-home-muted">{subtitle}</p>}
          {children}
          {footer && <div className="mt-6 border-t border-home-line pt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
