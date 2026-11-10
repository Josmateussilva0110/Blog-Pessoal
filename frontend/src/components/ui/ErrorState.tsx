import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
};

/** Falha ao buscar dados: separada do estado vazio para não mostrar informação falsa */
export function ErrorState({
  message = "Não foi possível carregar os dados.",
  onRetry,
  isRetrying = false,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cn("flex flex-col items-start gap-3", className)}>
      <p className="text-sm text-danger-text">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} disabled={isRetrying}>
          <RotateCw className={cn("size-4", isRetrying && "animate-spin")} aria-hidden />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
