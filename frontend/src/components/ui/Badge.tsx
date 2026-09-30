import { cn } from "@/lib/format";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-white/5 text-text-muted border-white/10",
  accent: "bg-accent-soft text-accent border-accent/25",
  success: "bg-success/15 text-terminal border-success/25",
  warning: "bg-warning/15 text-warning-text border-warning/25",
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
