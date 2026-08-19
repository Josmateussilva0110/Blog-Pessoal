import { cn } from "@/lib/format";
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
          <label htmlFor={inputId} className="text-sm text-text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            className={cn(
              "glass w-full rounded-xl px-3 py-2 pr-10 text-sm text-text",
              "placeholder:text-text-subtle",
              "focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
              "transition-all duration-200",
              error && "border-red-400/40",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className={cn(
              "absolute inset-y-0 right-0 flex items-center px-3",
              "text-text-subtle hover:text-text transition-colors",
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
        {error && <span className="text-xs text-red-300">{error}</span>}
      </div>
    );
  },
);
