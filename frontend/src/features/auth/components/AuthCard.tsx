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
    <div className="min-h-dvh flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 relative">
      <BackgroundOrbs />
      <div className="w-full max-w-sm glass-strong rounded-3xl p-6 sm:p-8 md:p-10 relative">
        <p className="text-xs font-medium text-accent mb-2">Admin</p>
        <h1 className="text-xl sm:text-2xl font-bold text-text mb-2">{title}</h1>
        {subtitle && (
          <p className="text-sm text-text-muted mb-6 leading-relaxed">{subtitle}</p>
        )}
        {children}
        {footer && <div className="mt-6 pt-6 border-t border-white/10">{footer}</div>}
      </div>
    </div>
  );
}
