import { cn } from "@/lib/format";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-white/5 text-text-muted border-white/10",
  accent: "bg-blue-500/15 text-accent border-blue-400/30",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-400/25",
  warning: "bg-amber-500/15 text-amber-300 border-amber-400/25",
  muted: "bg-white/5 text-text-subtle border-white/5",
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
