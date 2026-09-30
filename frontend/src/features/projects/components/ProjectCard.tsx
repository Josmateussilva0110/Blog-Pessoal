import { ArrowUpRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Project } from "@blog/shared";
import { ProjectCover } from "@/features/projects/components/ProjectCover";
import { useProjectCardLink } from "@/features/projects/hooks/useProjectCardLink";
import { TERMINAL_STATUS } from "@/features/projects/lib/terminalStatus";
import { cn } from "@/lib/format";
import { normalizeProjectStatus } from "@/lib/projectStatus";
import { normalizeProjectPlatform, PLATFORM_LABELS } from "@/lib/projectPlatform";
import { projectTransitionName } from "@/lib/viewTransition";

const MAX_TECH = 3;

interface ProjectCardProps {
  project: Project;
  /** Versão maior usada nos projetos em destaque */
  size?: "default" | "large";
}

export function ProjectCard({ project, size = "default" }: ProjectCardProps) {
  const { cardRef, handleClick } = useProjectCardLink(project);
  const statusInfo = TERMINAL_STATUS[normalizeProjectStatus(project.status)];
  const platform = normalizeProjectPlatform(project.platform);
  const isLarge = size === "large";
  const extraTech = project.techStack.length - MAX_TECH;
  const year = new Date(project.updatedAt).getFullYear();

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      onClick={handleClick}
    >
      <article
        ref={cardRef}
        data-project-slug={project.slug}
        className="project-card project-card-vt relative flex h-full flex-col overflow-hidden rounded-2xl"
        style={{ viewTransitionName: projectTransitionName(project.slug) }}
      >
        <ProjectCover
          project={project}
          platform={platform}
          sizes={
            isLarge
              ? "(min-width: 768px) 600px, 100vw"
              : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          }
          className={cn(
            "border-b border-white/[0.06]",
            isLarge ? "aspect-[16/10]" : "aspect-[16/11]",
          )}
        />

        <div className={cn("flex flex-1 flex-col", isLarge ? "gap-4 p-6" : "gap-3.5 p-5")}>
          <div className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-wider text-text-subtle">
            <span className="flex min-w-0 items-center gap-2">
              <span className={cn("size-1.5 shrink-0 rounded-full", statusInfo.stripe)} aria-hidden />
              <span className="truncate">
                {statusInfo.label} · {PLATFORM_LABELS[platform]}
              </span>
            </span>
            {project.featured && (
              <Star
                className="size-3.5 shrink-0 fill-amber-400 text-amber-400"
                aria-label="Projeto em destaque"
              />
            )}
          </div>

          <div className="flex-1">
            <h3
              className={cn(
                "font-semibold tracking-tight text-text transition-colors group-hover:text-accent",
                isLarge ? "mb-2 text-xl" : "mb-1.5 text-lg",
              )}
            >
              {project.title}
            </h3>
            <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">
              {project.description}
            </p>
          </div>

          {project.techStack.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Tecnologias">
              {project.techStack.slice(0, MAX_TECH).map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-text-muted"
                >
                  {tech}
                </li>
              ))}
              {extraTech > 0 && (
                <li className="px-1.5 py-0.5 text-xs font-medium text-text-subtle">
                  +{extraTech}
                </li>
              )}
            </ul>
          )}

          <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text transition-colors group-hover:text-accent">
              Ver projeto
              <ArrowUpRight
                className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
            <span className="font-mono text-xs text-text-subtle">{year}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
