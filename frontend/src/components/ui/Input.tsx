import { cn } from "@/lib/format";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="font-mono text-xs text-text-muted uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "rounded-md border border-border bg-surface-overlay px-3 py-2 font-mono text-sm text-text",
          "placeholder:text-text-subtle",
          "focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20",
          "transition-colors duration-200",
          error && "border-red-500/50",
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
