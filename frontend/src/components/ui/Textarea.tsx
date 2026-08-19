import { cn } from "@/lib/format";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s/g, "-");

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={textareaId} className="text-sm text-text-muted">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "glass min-h-32 rounded-xl px-3 py-2 text-sm text-text resize-y",
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
