import { cn } from "@/lib/format";
import { FIELD_CLASS, FIELD_ERROR_CLASS, FIELD_ERROR_TEXT_CLASS, LABEL_CLASS } from "./fieldStyles";
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
        <label htmlFor={inputId} className={LABEL_CLASS}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          FIELD_CLASS,
          error && FIELD_ERROR_CLASS,
          className,
        )}
        {...props}
      />
      {error && <span className={FIELD_ERROR_TEXT_CLASS}>{error}</span>}
    </div>
  );
}
