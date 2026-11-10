/** Placeholder da página de atualização: usado no download da página e na busca dos dados */
export function ProjectUpdateSkeleton() {
  return (
    <div className="flex flex-col gap-3 pt-4 sm:pt-6">
      <span role="status" className="sr-only">
        Carregando atualização…
      </span>
      <div className="home-card animate-pulse space-y-4 p-6 sm:p-10" aria-hidden>
        <div className="h-9 w-40 rounded-xl bg-home-inset" />
        <div className="h-3 w-40 rounded bg-home-inset" />
        <div className="h-10 w-2/3 rounded-lg bg-home-inset" />
      </div>
      <div className="home-card animate-pulse space-y-3 p-6 sm:p-10" aria-hidden>
        <div className="h-4 w-full rounded bg-home-inset" />
        <div className="h-4 w-5/6 rounded bg-home-inset" />
        <div className="h-4 w-4/6 rounded bg-home-inset" />
      </div>
    </div>
  );
}
