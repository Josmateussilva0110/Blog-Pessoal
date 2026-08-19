import { cn } from "@/lib/format";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s/g, "-");

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={selectId} className="text-sm text-text-muted">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "glass rounded-xl px-3 py-2 text-sm text-text",
          "focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/25",
          "transition-all duration-200",
          error && "border-red-400/40",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
