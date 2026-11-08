import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { FIELD_CLASS, FIELD_ERROR_CLASS } from "./fieldStyles";
import { FormField, useFieldIds } from "./FormField";

interface PasswordInputProps extends Omit<ComponentProps<"input">, "type"> {
  label?: string;
  error?: string;
}

export function PasswordInput({
  label,
  error,
  className,
  id,
  "aria-describedby": describedBy,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const { fieldId, errorId, controlProps } = useFieldIds(id, error, describedBy);

  return (
    <FormField label={label} fieldId={fieldId} error={error} errorId={errorId}>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          className={cn(FIELD_CLASS, "pr-10", error && FIELD_ERROR_CLASS, className)}
          {...controlProps}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-home-muted transition-colors hover:text-home-ink focus-visible:outline-2 focus-visible:outline-brand"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
    </FormField>
  );
}
