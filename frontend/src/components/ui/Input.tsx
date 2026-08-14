import { cn } from "@/lib/format";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-sm text-text-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "glass rounded-xl px-3 py-2 text-sm text-text",
          "placeholder:text-text-subtle",
          "focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/25",
          "transition-all duration-200",
          error && "border-red-400/40",
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
