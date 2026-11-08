import { cn } from "@/lib/format";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-home-inset text-home-body border-home-line",
  accent: "bg-brand/15 text-brand border-brand/25",
  success: "bg-success/15 text-success-text border-success/25",
  warning: "bg-warning/15 text-warning-text border-warning/25",
  muted: "bg-home-inset text-home-muted border-transparent",
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
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
