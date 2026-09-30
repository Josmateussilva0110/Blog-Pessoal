import { projectTransitionName } from "@/lib/viewTransition";

/** Placeholder da página do projeto; mantém o nome da view transition do card */
export function ProjectDetailSkeleton({ slug }: { slug: string }) {
  return (
    <div className="py-6 project-detail-vt" style={{ viewTransitionName: projectTransitionName(slug) }}>
      <div className="animate-pulse">
        <div className="h-4 w-36 rounded bg-surface-muted" />
        <div className="mt-8 max-w-3xl space-y-4">
          <div className="h-3 w-56 rounded bg-surface-muted" />
          <div className="h-10 w-2/3 rounded bg-surface-muted" />
          <div className="h-4 w-full rounded bg-surface-muted" />
        </div>
        <div className="project-card mt-10 h-80 rounded-2xl" />
      </div>
    </div>
  );
}
