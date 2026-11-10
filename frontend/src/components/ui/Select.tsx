import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { FIELD_CLASS, FIELD_ERROR_CLASS } from "./fieldStyles";
import { FormField, useFieldIds } from "./FormField";

interface SelectProps extends ComponentProps<"select"> {
  label?: string;
  error?: string;
}

export function Select({
  label,
  error,
  className,
  id,
  "aria-describedby": describedBy,
  children,
  ...props
}: SelectProps) {
  const { fieldId, errorId, controlProps } = useFieldIds(id, error, describedBy);

  return (
    <FormField label={label} fieldId={fieldId} error={error} errorId={errorId}>
      <select
        className={cn(FIELD_CLASS, error && FIELD_ERROR_CLASS, className)}
        {...controlProps}
        {...props}
      >
        {children}
      </select>
    </FormField>
  );
}
