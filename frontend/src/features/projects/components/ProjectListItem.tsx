import type { Project } from "@blog/shared";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getProjectCover } from "@/features/projects/lib/projectCover";
import { useProjectCardLink } from "@/features/projects/hooks/useProjectCardLink";
import { ProjectStage } from "@/features/projects/components/ProjectStage";
import { cn } from "@/lib/cn";
import { normalizeProjectPlatform, PLATFORM_KIND_LABELS } from "@/lib/projectPlatform";
import { ROUTES } from "@/config/routes";

const ROW_CLASS =
  "group flex w-full items-center gap-3.5 rounded-[0.875rem] px-3 py-2.5 text-left text-home-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

function Thumbnail({ project }: { project: Project }) {
  const cover = getProjectCover(project);

  if (!cover) {
    return (
      <span className="flex size-11 shrink-0 items-center justify-center rounded-[0.625rem] border border-home-line bg-home-inset font-semibold text-home-muted">
        {project.title.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={cover.thumb}
      alt=""
      width={44}
      height={44}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      className="size-11 shrink-0 rounded-[0.625rem] border border-home-line object-cover object-top"
    />
  );
}

function RowText({ project, detail }: { project: Project; detail: string }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="font-semibold">{project.title}</span>
      <span className="truncate text-caption text-home-muted">{detail}</span>
    </span>
  );
}

/** Mesmo `sizes` do palco: o navegador escolhe a mesma variante que o palco vai pedir */
const STAGE_SIZES: Record<"mobile" | "web", string> = {
  mobile: "236px",
  web: "(min-width: 1024px) 760px, 100vw",
};

function preloadStage(project: Project) {
  const cover = getProjectCover(project);
  if (!cover) return;
  const image = new window.Image();
  image.sizes = STAGE_SIZES[normalizeProjectPlatform(project.platform)];
  if (cover.srcSet) image.srcset = cover.srcSet;
  image.src = cover.thumb;
}

interface ProjectSelectItemProps {
  project: Project;
  selected: boolean;
  onSelect: () => void;
}

/** Linha da lista no desktop: seleciona o projeto e mostra o detalhe ao lado */
export function ProjectSelectItem({ project, selected, onSelect }: ProjectSelectItemProps) {
  const platform = normalizeProjectPlatform(project.platform);

  return (
    <button
      type="button"
      onClick={onSelect}
      onPointerEnter={() => preloadStage(project)}
      onFocus={() => preloadStage(project)}
      aria-current={selected ? "true" : undefined}
      className={cn(ROW_CLASS, selected ? "bg-home-inset" : "hover:bg-home-inset/60")}
    >
      <Thumbnail project={project} />
      <RowText project={project} detail={PLATFORM_KIND_LABELS[platform]} />
      <ChevronRight
        className={cn(
          "size-4 shrink-0 transition-opacity",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-40",
        )}
        aria-hidden
      />
    </button>
  );
}

/** Card do carrossel no celular: sem painel de detalhe, abre o projeto direto */
export function ProjectCardItem({ project }: { project: Project }) {
  const { handleClick } = useProjectCardLink(project);
  const platform = normalizeProjectPlatform(project.platform);
  const year = new Date(project.createdAt).getFullYear();

  return (
    <Link
      to={ROUTES.project(project.slug)}
      onClick={handleClick}
      className="group flex h-full flex-col gap-3 rounded-[1.25rem] bg-home-inset p-2 pb-4 text-home-ink transition-colors hover:bg-home-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <ProjectStage project={project} compact />
      <span className="flex flex-col gap-1 px-2">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-lg font-semibold tracking-heading">{project.title}</span>
          <ArrowUpRight className="size-4 shrink-0 text-home-muted" aria-hidden />
        </span>
        <span className="font-mono text-xs text-home-muted">
          {PLATFORM_KIND_LABELS[platform]} · {year}
        </span>
        <span className="mt-1 line-clamp-2 text-sm leading-relaxed text-home-body">{project.description}</span>
      </span>
    </Link>
  );
}
