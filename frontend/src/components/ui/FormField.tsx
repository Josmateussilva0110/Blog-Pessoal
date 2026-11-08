import { useId, type ReactNode } from "react";
import { FIELD_ERROR_TEXT_CLASS, LABEL_CLASS } from "./fieldStyles";

/**
 * Ids do campo e da mensagem de erro, mais os atributos que ligam os dois para leitores
 * de tela. useId evita ids repetidos quando dois campos têm o mesmo rótulo.
 */
export function useFieldIds(id: string | undefined, error: string | undefined, describedBy?: string) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const describedByIds = [describedBy, error ? errorId : undefined].filter(Boolean).join(" ");

  return {
    fieldId,
    errorId,
    controlProps: {
      id: fieldId,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": describedByIds || undefined,
    },
  };
}

type FormFieldProps = {
  label?: ReactNode;
  fieldId: string;
  error?: string;
  errorId: string;
  children: ReactNode;
};

/** Rótulo, controle e mensagem de erro com o mesmo espaçamento em todos os campos */
export function FormField({ label, fieldId, error, errorId, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={fieldId} className={LABEL_CLASS}>
          {label}
        </label>
      )}
      {children}
      {error && (
        <span id={errorId} className={FIELD_ERROR_TEXT_CLASS}>
          {error}
        </span>
      )}
    </div>
  );
}
