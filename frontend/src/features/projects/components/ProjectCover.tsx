import type { Project, ProjectPlatform } from "@blog/shared";
import { Image } from "@/components/ui/Image";
import { getProjectCover } from "@/features/projects/lib/projectCover";
import { cn } from "@/lib/format";

interface ProjectCoverProps {
  project: Project;
  platform: ProjectPlatform;
  /** Largura aproximada da capa na tela, repassada ao `sizes` da imagem */
  sizes: string;
  className?: string;
}

/**
 * Capa do card. Prints de celular ficam num aparelho sobre um fundo com brilho
 * (sem faixas pretas); prints web ocupam a área toda. Nada de `filter: blur`
 * aqui: o card é transformado em 3D e o Chrome projeta filtros grandes errado.
 */
export function ProjectCover({ project, platform, sizes, className }: ProjectCoverProps) {
  const cover = getProjectCover(project);
  const alt = `Preview de ${project.title}`;

  return (
    <div className={cn("relative overflow-hidden bg-surface-inset", className)}>
      {!cover ? (
        <div className="project-cover-empty flex h-full items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-2xl border border-hairline-strong bg-surface-muted text-xl font-semibold text-text-muted">
            {project.title.charAt(0).toUpperCase()}
          </span>
        </div>
      ) : platform === "mobile" ? (
        <>
          <div className="project-cover-mobile absolute inset-0" aria-hidden />
          {/* Aparelho grande e cortado embaixo: a parte de cima da tela fica
              legível, em vez da tela inteira espremida em ~120px de largura */}
          <div className="absolute inset-x-0 top-[12%] flex justify-center">
            <div className="aspect-[9/19.5] w-[46%] overflow-hidden rounded-[1.6rem] border-[3px] border-hairline-strong bg-black shadow-2xl shadow-black/60 transition-transform duration-500 ease-out group-hover:-translate-y-2">
              <Image
                src={cover.thumb}
                srcSet={cover.srcSet}
                sizes="(min-width: 768px) 280px, 46vw"
                decoding="async"
                fallback={cover.original}
                alt={alt}
                rounded="none"
                fit="cover"
                className="h-full w-full bg-transparent object-top"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <Image
            src={cover.thumb}
            srcSet={cover.srcSet}
            sizes={sizes}
            decoding="async"
            fallback={cover.original}
            alt={alt}
            rounded="none"
            fit="cover"
            className="h-full w-full bg-transparent object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface-inset/70 to-transparent" />
        </>
      )}
    </div>
  );
}
