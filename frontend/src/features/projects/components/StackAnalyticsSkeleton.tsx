/**
 * Mesma grade e alturas próximas das reais dos quatro gráficos (medidas no celular e no
 * desktop): a seção não empurra o resto da página quando o chunk e os dados chegam
 */
export function StackAnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="home-card h-[33.5rem] animate-pulse" />
        <div className="home-card h-[25rem] animate-pulse lg:h-[33.5rem]" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="home-card h-[24rem] animate-pulse md:h-[30rem]" />
        <div className="home-card h-[29rem] animate-pulse md:h-[30rem]" />
      </div>
    </div>
  );
}
