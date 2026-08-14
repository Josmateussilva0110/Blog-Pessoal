import { cn } from "@/lib/format";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-blue-600/90 to-sky-500/90 text-white border border-blue-400/30 hover:from-blue-500 hover:to-sky-400 shadow-lg shadow-blue-600/25",
  secondary: "glass text-text hover:bg-white/10",
  ghost: "text-text-muted hover:text-text hover:bg-white/5",
  outline: "glass text-text-muted hover:text-text hover:bg-white/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-xl",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-sm rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
