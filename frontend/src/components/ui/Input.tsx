import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { FIELD_CLASS, FIELD_ERROR_CLASS } from "./fieldStyles";
import { FormField, useFieldIds } from "./FormField";

interface InputProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className,
  id,
  "aria-describedby": describedBy,
  ...props
}: InputProps) {
  const { fieldId, errorId, controlProps } = useFieldIds(id, error, describedBy);

  return (
    <FormField label={label} fieldId={fieldId} error={error} errorId={errorId}>
      <input
        className={cn(FIELD_CLASS, error && FIELD_ERROR_CLASS, className)}
        {...controlProps}
        {...props}
      />
    </FormField>
  );
}
