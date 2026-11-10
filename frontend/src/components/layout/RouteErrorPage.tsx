import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Button, buttonClassName } from "@/components/ui/Button";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/cn";

// Chunk lazy que sumiu depois de um deploy: as mensagens variam por navegador
const CHUNK_ERROR_PATTERN =
  /dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;

function getErrorMessage(error: unknown) {
  if (error instanceof Error && CHUNK_ERROR_PATTERN.test(error.message)) {
    return "O site foi atualizado. Recarregue a página para continuar.";
  }
  if (isRouteErrorResponse(error) && error.status === 404) {
    return "Página não encontrada.";
  }
  return "Algo deu errado ao abrir esta página.";
}

type RouteErrorPageProps = {
  /** Sem layout em volta (erro na raiz ou fora dos layouts): ocupa a tela toda */
  fullPage?: boolean;
};

/** errorElement das rotas: evita a página em branco quando um render ou import lazy falha */
export function RouteErrorPage({ fullPage = false }: RouteErrorPageProps) {
  const error = useRouteError();

  return (
    <div
      className={cn(
        "flex items-center justify-center p-4",
        fullPage ? "min-h-dvh bg-home-bg" : "min-h-[50vh]",
      )}
    >
      <div
        role="alert"
        className="home-card flex max-w-md flex-col items-center gap-4 px-6 py-12 text-center"
      >
        <h1 className="text-xl font-semibold text-home-ink">Não foi possível carregar</h1>
        <p className="text-home-muted">{getErrorMessage(error)}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => window.location.reload()}>Recarregar</Button>
          {/* Link comum (não SPA): recomeça o app do zero */}
          <a href={ROUTES.home} className={buttonClassName({ variant: "secondary" })}>
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}
