import { cn } from "@/lib/format";
import { FIELD_CLASS, FIELD_ERROR_CLASS, FIELD_ERROR_TEXT_CLASS, LABEL_CLASS } from "./fieldStyles";
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
        <label htmlFor={textareaId} className={LABEL_CLASS}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          FIELD_CLASS,
          "min-h-32 resize-y",
          error && FIELD_ERROR_CLASS,
          className,
        )}
        {...props}
      />
      {error && <span className={FIELD_ERROR_TEXT_CLASS}>{error}</span>}
    </div>
  );
}
