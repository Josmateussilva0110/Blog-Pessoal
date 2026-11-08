import { cn } from "@/lib/format";
import { FIELD_CLASS, FIELD_ERROR_CLASS, FIELD_ERROR_TEXT_CLASS, LABEL_CLASS } from "./fieldStyles";
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
        <label htmlFor={selectId} className={LABEL_CLASS}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          FIELD_CLASS,
          error && FIELD_ERROR_CLASS,
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <span className={FIELD_ERROR_TEXT_CLASS}>{error}</span>}
    </div>
  );
}
