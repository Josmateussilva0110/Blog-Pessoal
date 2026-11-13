import type { Project } from "@blog/shared";
import { Image } from "@/components/ui/Image";
import { getProjectCover } from "@/features/projects/lib/projectCover";
import { cn } from "@/lib/cn";
import { normalizeProjectPlatform, PLATFORM_KIND_LABELS } from "@/lib/projectPlatform";

/**
 * `sizes` do print no palco (também usados no preload da lista). Web desktop: 37rem =
 * paddings do main, do card e do palco + lista + gap; ajuste se o layout mudar.
 */
export const STAGE_SIZES = {
  mobile: "236px",
  web: "min(calc(100vw - 37rem), 47.5rem)",
  compactMobile: "136px",
  // Card do carrossel: 78% (45% a partir de sm) da faixa, até 20rem, menos os paddings
  compactWeb:
    "(min-width: 640px) calc(min(45vw - 2.9rem, 20rem) - 3.5rem), calc(min(78vw - 3.1rem, 20rem) - 3.5rem)",
} as const;

interface ProjectStageProps {
  project: Project;
  /** Versão menor, sem os rótulos no topo, usada nos cards do carrossel no celular */
  compact?: boolean;
}

/**
 * Palco do projeto: print de celular num aparelho saindo da borda de baixo,
 * print web numa janela com borda. Sem `filter: blur`: o palco fica dentro
 * de painéis com transform 3D e o Chrome projeta filtros errado.
 */
export function ProjectStage({ project, compact = false }: ProjectStageProps) {
  const cover = getProjectCover(project);
  const platform = normalizeProjectPlatform(project.platform);
  const alt = `Tela do ${project.title}`;

  return (
    <div
      className={cn(
        "home-stage relative flex items-end justify-center overflow-hidden",
        compact ? "h-52 rounded-2xl px-5 pt-7" : "h-[27.5rem] rounded-[1.25rem] px-6 pt-16 sm:px-14",
      )}
    >
      {!compact && (
        <div className="absolute inset-x-6 top-5 flex items-center justify-between gap-3 font-mono text-2xs uppercase tracking-eyebrow text-on-scrim/60">
          <span className="truncate">{project.title}</span>
          <span className="shrink-0">{PLATFORM_KIND_LABELS[platform]}</span>
        </div>
      )}

      {!cover ? (
        <span className="my-auto flex size-16 items-center justify-center rounded-2xl bg-home-raised text-2xl font-semibold text-home-muted">
          {project.title.charAt(0).toUpperCase()}
        </span>
      ) : platform === "mobile" ? (
        <div
          className={cn(
            "border border-b-0 border-on-scrim/15 bg-home-device shadow-stage",
            compact
              ? "w-[8.5rem] rounded-t-[1.75rem] px-1.5 pt-1.5"
              : "w-[14.75rem] rounded-t-[2.625rem] px-[9px] pt-[9px]",
          )}
        >
          <Image
            src={cover.thumb}
            srcSet={cover.srcSet}
            sizes={compact ? STAGE_SIZES.compactMobile : STAGE_SIZES.mobile}
            fallback={cover.original}
            alt={alt}
            fit="cover"
            rounded="none"
            decoding="async"
            className={cn(
              "block w-full bg-transparent object-top",
              compact ? "h-[11.25rem] rounded-t-[1.375rem]" : "h-[21.5rem] rounded-t-[2.0625rem]",
            )}
          />
        </div>
      ) : (
        // Sem barra de navegador desenhada: os prints web já costumam trazer a do próprio navegador
        <div className="w-full max-w-[47.5rem] overflow-hidden rounded-t-[0.875rem] border border-b-0 border-on-scrim/12 bg-home-device shadow-stage">
          <Image
            src={cover.thumb}
            srcSet={cover.srcSet}
            sizes={compact ? STAGE_SIZES.compactWeb : STAGE_SIZES.web}
            fallback={cover.original}
            alt={alt}
            fit="cover"
            rounded="none"
            decoding="async"
            className={cn(
              "block w-full bg-transparent object-left-top",
              compact ? "h-[10.5rem]" : "h-[21.5rem]",
            )}
          />
        </div>
      )}
    </div>
  );
}
