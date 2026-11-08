import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { FIELD_CLASS, FIELD_ERROR_CLASS } from "./fieldStyles";
import { FormField, useFieldIds } from "./FormField";

interface TextareaProps extends ComponentProps<"textarea"> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className,
  id,
  "aria-describedby": describedBy,
  ...props
}: TextareaProps) {
  const { fieldId, errorId, controlProps } = useFieldIds(id, error, describedBy);

  return (
    <FormField label={label} fieldId={fieldId} error={error} errorId={errorId}>
      <textarea
        className={cn(FIELD_CLASS, "min-h-32 resize-y", error && FIELD_ERROR_CLASS, className)}
        {...controlProps}
        {...props}
      />
    </FormField>
  );
}
