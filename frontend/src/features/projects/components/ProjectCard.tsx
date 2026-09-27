import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Project } from "@blog/shared";
import { Image } from "@/components/ui/Image";
import { TerminalWindowBar } from "@/components/ui/TerminalWindow";
import { PlatformCardLabel } from "@/features/projects/components/PlatformBadge";
import { CardPrompt } from "@/features/projects/components/CardPrompt";
import { useProjectCardLink } from "@/features/projects/hooks/useProjectCardLink";
import { getProjectCover } from "@/features/projects/lib/projectCover";
import { TERMINAL_STATUS } from "@/features/projects/lib/terminalStatus";
import { cn } from "@/lib/format";
import { normalizeProjectStatus } from "@/lib/projectStatus";
import { normalizeProjectPlatform } from "@/lib/projectPlatform";
import { projectTransitionName } from "@/lib/viewTransition";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { cardRef, handleClick } = useProjectCardLink(project);
  const statusInfo = TERMINAL_STATUS[normalizeProjectStatus(project.status)];
  const platform = normalizeProjectPlatform(project.platform);
  const cover = getProjectCover(project);

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="block group h-full"
      onClick={handleClick}
    >
      <article
        ref={cardRef}
        data-project-slug={project.slug}
        className="terminal-card h-full flex flex-col overflow-hidden project-card-vt"
        style={{ viewTransitionName: projectTransitionName(project.slug) }}
      >
        <TerminalWindowBar
          path={`~/${project.slug}`}
          trailing={
            <span className="flex shrink-0 items-center gap-2">
              {project.featured && (
                <Star
                  className="size-3.5 fill-amber-400 text-amber-400"
                  aria-label="Projeto em destaque"
                />
              )}
              <span className={cn("font-mono text-[10px]", statusInfo.className)}>
                {statusInfo.icon} {statusInfo.short}
              </span>
            </span>
          }
        />

        <div className="crt-screen relative aspect-video border-b border-border-subtle bg-[#06060c]">
          {cover ? (
            <Image
              src={cover.thumb}
              fallback={cover.original}
              alt={`Preview de ${project.title}`}
              rounded="none"
              fit={platform === "mobile" ? "contain" : "cover"}
              className={cn(
                "h-full w-full bg-transparent",
                platform === "web" && "object-top",
              )}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 font-mono text-[11px] text-text-subtle">
              <span className="text-accent/70">~/{project.slug}</span>
              <span>// sem preview</span>
            </div>
          )}
          <PlatformCardLabel
            platform={platform}
            className="absolute bottom-2.5 left-2.5 z-10"
          />
        </div>

        <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-text group-hover:text-accent transition-colors mb-1.5">
              {project.title}
            </h3>
            <p className="text-sm text-text-muted leading-relaxed line-clamp-2">
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

          <CardPrompt
            command={`cd ${project.slug} && ./abrir`}
            className="pt-3 border-t border-border-subtle"
          />
        </div>
      </article>
    </Link>
  );
}
