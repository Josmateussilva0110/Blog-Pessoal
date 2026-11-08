import type { Project } from "@blog/shared";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TiltCard } from "@/components/ui/TiltCard";
import { ProjectStage } from "@/features/projects/components/ProjectStage";
import { TechIconChip } from "@/features/projects/components/TechIconChip";
import { useProjectCardLink } from "@/features/projects/hooks/useProjectCardLink";
import { normalizeProjectPlatform, PLATFORM_KIND_LABELS } from "@/lib/projectPlatform";
import { getTechMeta } from "@/lib/skillicons";
import { ROUTES } from "@/config/routes";

/** Detalhe do projeto selecionado no explorador da home */
export function ProjectSpotlight({ project }: { project: Project }) {
  const { cardRef, handleClick } = useProjectCardLink(project);
  const platform = normalizeProjectPlatform(project.platform);
  const year = new Date(project.createdAt).getFullYear();
  // "node.js" e "nodejs" viram o mesmo chip
  const techs = [...new Set(project.techStack.map((tech) => getTechMeta(tech).label))];
  const projectUrl = ROUTES.project(project.slug);

  return (
    <article ref={cardRef} className="flex min-w-0 flex-col gap-5">
      {/* O palco também abre o projeto; fora da ordem de tabulação, o botão "Ver projeto" já cobre */}
      <Link to={projectUrl} onClick={handleClick} tabIndex={-1} aria-hidden className="block">
        <TiltCard max={4}>
          <ProjectStage project={project} />
        </TiltCard>
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-[999_1_22rem]">
          <div className="mb-2 flex flex-wrap items-baseline gap-3">
            <h3 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-home-ink">
              {project.title}
            </h3>
            <span className="font-mono text-xs text-home-muted">
              {PLATFORM_KIND_LABELS[platform]} · {year}
            </span>
          </div>
          <p className="mb-4 max-w-[35rem] leading-relaxed text-home-body">{project.description}</p>
          {techs.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Tecnologias">
              {techs.map((tech) => (
                <TechIconChip key={tech} name={tech} />
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={projectUrl}
            onClick={handleClick}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4.5 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand bg-home-ink text-home-device hover:bg-white"
          >
            Ver projeto
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
