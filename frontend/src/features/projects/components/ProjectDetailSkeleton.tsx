import { projectTransitionName } from "@/lib/viewTransition";

/** Placeholder da página do projeto; mantém o nome da view transition do card */
export function ProjectDetailSkeleton({ slug }: { slug: string }) {
  return (
    <div
      className="flex flex-col gap-3 pt-4 sm:pt-6 project-detail-vt"
      style={{ viewTransitionName: projectTransitionName(slug) }}
    >
      <span role="status" className="sr-only">
        Carregando projeto…
      </span>
      <div className="home-card animate-pulse space-y-4 p-6 sm:p-10" aria-hidden>
        <div className="h-9 w-40 rounded-xl bg-home-inset" />
        <div className="h-3 w-52 rounded bg-home-inset" />
        <div className="h-12 w-2/3 rounded-lg bg-home-inset" />
        <div className="h-4 w-full max-w-xl rounded bg-home-inset" />
        <div className="h-20 rounded-2xl bg-home-inset" />
      </div>
      <div className="home-card h-80 animate-pulse" aria-hidden />
    </div>
  );
}
