import type { ReactNode } from "react";
import { BackgroundOrbs } from "@/components/layout/BackgroundOrbs";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 relative grid-bg">
      <BackgroundOrbs />
      <div className="w-full max-w-sm terminal-card overflow-hidden relative">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle bg-surface-raised">
          <span className="h-2 w-2 rounded-full bg-red-500/80" />
          <span className="h-2 w-2 rounded-full bg-amber-400/80" />
          <span className="h-2 w-2 rounded-full bg-terminal/80" />
          <span className="font-mono text-[10px] ml-1">
            <span className="text-terminal">mateus@dev</span>
            <span className="text-text-subtle">:</span>
            <span className="text-accent">~/login</span>
          </span>
        </div>

        <div className="p-6 sm:p-8">
          <p className="code-comment mb-3">// admin auth</p>
          <h1 className="font-mono text-xl sm:text-2xl font-bold text-text mb-2">
            {title}()
          </h1>
          {subtitle && (
            <p className="text-sm text-text-muted mb-6 leading-relaxed">{subtitle}</p>
          )}
          {children}
          {footer && (
            <div className="mt-6 pt-6 border-t border-border-subtle">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
}
