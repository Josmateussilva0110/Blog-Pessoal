import { useRef, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import type { Project, ProjectStatus } from "@blog/shared";
import { useProjectTransition } from "@/features/projects/context/ProjectTransitionProvider";
import { normalizeProjectStatus } from "@/lib/projectStatus";
import { projectTransitionName } from "@/lib/viewTransition";

interface ProjectCardProps {
  project: Project;
}

const TERMINAL_STATUS: Record<
  ProjectStatus,
  { label: string; icon: string; className: string }
> = {
  planned: {
    label: "PLANEJADO",
    icon: "▲",
    className: "text-amber-400",
  },
  wip: {
    label: "EM ANDAMENTO",
    icon: "●",
    className: "text-terminal",
  },
  completed: {
    label: "CONCLUÍDO",
    icon: "✓",
    className: "text-accent",
  },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const { openProject } = useProjectTransition();
  const cardRef = useRef<HTMLElement>(null);
  const status = normalizeProjectStatus(project.status);
  const statusInfo = TERMINAL_STATUS[status];

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (!cardRef.current) return;

    event.preventDefault();
    openProject(project, cardRef.current);
  }

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="block group"
      onClick={handleClick}
    >
      <article
        ref={cardRef}
        className="terminal-card h-full flex flex-col overflow-hidden project-card-vt"
        style={{ viewTransitionName: projectTransitionName(project.slug) }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle bg-surface-raised">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-terminal/80" />
          <span className="font-mono text-[11px] ml-2 truncate">
            <span className="text-terminal">mateus@dev</span>
            <span className="text-text-subtle">:</span>
            <span className="text-accent">~/{project.slug}</span>
          </span>
        </div>

        <div className="p-5 flex flex-col flex-1 gap-4">
          <p className="font-mono text-xs">
            <span className="text-terminal">$ </span>
            <span className="text-accent">git log</span>
            <span className="text-text-muted"> --oneline -1</span>
          </p>

          <div className="flex-1">
            <h3 className="text-base font-semibold text-text group-hover:text-accent transition-colors mb-2">
              {project.title}
            </h3>
            <p className="text-sm text-text-muted leading-relaxed line-clamp-3">
              {project.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="font-mono text-[10px] text-accent/80 bg-accent-soft border border-accent/20 px-2 py-0.5 rounded"
              >
                --{tech.toLowerCase()}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="font-mono text-[10px] text-text-subtle px-2 py-0.5">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
            <span
              className={`font-mono text-[10px] uppercase tracking-wider ${statusInfo.className}`}
            >
              {statusInfo.icon} {statusInfo.label}
            </span>
            <div className="flex gap-3">
              {project.repoUrl && (
                <span className="font-mono text-[10px] text-text-subtle group-hover:text-text-muted transition-colors">
                  github
                </span>
              )}
              <span className="font-mono text-[10px] text-text-subtle group-hover:text-text-muted transition-colors">
                demo
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
