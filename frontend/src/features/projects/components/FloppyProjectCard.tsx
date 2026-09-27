import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Project } from "@blog/shared";
import { Image } from "@/components/ui/Image";
import { CardPrompt } from "@/features/projects/components/CardPrompt";
import { useProjectCardLink } from "@/features/projects/hooks/useProjectCardLink";
import { getProjectCover } from "@/features/projects/lib/projectCover";
import { TERMINAL_STATUS } from "@/features/projects/lib/terminalStatus";
import { cn } from "@/lib/format";
import { normalizeProjectStatus } from "@/lib/projectStatus";
import { normalizeProjectPlatform } from "@/lib/projectPlatform";
import { projectTransitionName } from "@/lib/viewTransition";

interface FloppyProjectCardProps {
  project: Project;
}

/** Disco magnético mostrado na janela quando o projeto não tem imagem */
function MagneticDisk() {
  return (
    <div className="flex h-full items-center justify-center bg-[#12121c]">
      <div className="flex aspect-square h-[85%] items-center justify-center rounded-full bg-[#1c1c2a] ring-1 ring-white/5">
        <div className="size-[28%] rounded-full border border-slate-500/40 bg-slate-600/40" />
      </div>
    </div>
  );
}

export function FloppyProjectCard({ project }: FloppyProjectCardProps) {
  const { cardRef, handleClick } = useProjectCardLink(project);
  const status = normalizeProjectStatus(project.status);
  const statusInfo = TERMINAL_STATUS[status];
  const platform = normalizeProjectPlatform(project.platform);
  const cover = getProjectCover(project);

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group mx-auto block w-full max-w-[20rem] rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      onClick={handleClick}
    >
      <article
        ref={cardRef}
        data-project-slug={project.slug}
        className="floppy-card project-card-vt relative aspect-[1/1.08] w-full p-px"
        style={{ viewTransitionName: projectTransitionName(project.slug) }}
      >
        <div className="floppy-body relative h-full w-full">
          {/* Trilho e shutter metálico */}
          <div className="absolute left-[20%] right-[20%] top-0 h-[40%] overflow-hidden rounded-b-md border border-t-0 border-border bg-black/50">
            <div className="crt-screen absolute inset-x-[8%] bottom-[10%] top-[10%] rounded-sm bg-[#06060c]">
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
                <MagneticDisk />
              )}
            </div>
            <div className="floppy-shutter absolute inset-y-0 left-0 w-[82%]" aria-hidden>
              <div className="absolute left-[58%] top-[14%] h-[66%] w-[20%] rounded-sm bg-black/70 shadow-inner" />
            </div>
          </div>

          {/* Furo de proteção de escrita: aberto quando o projeto está concluído */}
          <span
            className={cn(
              "absolute bottom-[3.5%] left-[3.5%] size-2.5 rounded-[2px] border border-border",
              status === "completed" ? "bg-black" : "bg-slate-600/60",
            )}
            aria-hidden
          />

          {/* Etiqueta */}
          <div className="absolute inset-x-[9%] bottom-0 top-[46%] flex flex-col overflow-hidden rounded-t-md border border-b-0 border-border-subtle bg-[#11111c]">
            <div className={cn("h-1 shrink-0", statusInfo.stripe)} />
            <div className="flex min-h-0 flex-1 flex-col gap-1.5 px-3 pb-2.5 pt-2">
              <p className="flex items-center justify-between gap-2 font-mono text-[10px] text-text-subtle">
                <span className="truncate">A:\{project.slug}.exe</span>
                {project.featured && (
                  <Star
                    className="size-3 shrink-0 fill-amber-400 text-amber-400"
                    aria-label="Projeto em destaque"
                  />
                )}
              </p>
              <h3 className="truncate text-sm font-semibold leading-tight text-text transition-colors group-hover:text-accent">
                {project.title}
              </h3>
              <p className="line-clamp-2 text-xs leading-snug text-text-muted">
                {project.description}
              </p>
              <p className="mt-auto truncate font-mono text-[10px] text-accent/80">
                {project.techStack
                  .slice(0, 3)
                  .map((tech) => `--${tech.toLowerCase()}`)
                  .join(" ")}
              </p>
              <div className="flex items-center justify-between gap-2 border-t border-border-subtle pt-1.5">
                <CardPrompt command={`mount ${project.slug}`} className="min-w-0 flex-1" />
                <span
                  className={cn(
                    "shrink-0 font-mono text-[10px] uppercase",
                    statusInfo.className,
                  )}
                >
                  {statusInfo.icon} {platform}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
