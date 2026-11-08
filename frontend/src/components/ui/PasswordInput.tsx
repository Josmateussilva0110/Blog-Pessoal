import { cn } from "@/lib/format";
import { FIELD_CLASS, FIELD_ERROR_CLASS, FIELD_ERROR_TEXT_CLASS, LABEL_CLASS } from "./fieldStyles";
import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label, error, className, id, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className={LABEL_CLASS}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            className={cn(
              FIELD_CLASS,
              "pr-10",
              error && FIELD_ERROR_CLASS,
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className={cn(
              "absolute inset-y-0 right-0 flex items-center px-3",
              "rounded-r-xl text-home-muted transition-colors hover:text-home-ink focus-visible:outline-2 focus-visible:outline-brand",
            )}
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          >
            {visible ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        </div>
        {error && <span className={FIELD_ERROR_TEXT_CLASS}>{error}</span>}
      </div>
    );
  },
);
