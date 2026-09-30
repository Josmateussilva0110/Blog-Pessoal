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
    <div className={cn("relative overflow-hidden bg-[#0b0b14]", className)}>
      {!cover ? (
        <div className="project-cover-empty flex h-full items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl font-semibold text-text-muted">
            {project.title.charAt(0).toUpperCase()}
          </span>
        </div>
      ) : platform === "mobile" ? (
        <>
          <div className="project-cover-mobile absolute inset-0" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 top-[10%] flex justify-center">
            <div className="h-[112%] aspect-[9/19.5] overflow-hidden rounded-[1.4rem] border-[3px] border-white/10 bg-black shadow-2xl shadow-black/60 transition-transform duration-500 ease-out group-hover:-translate-y-2">
              <Image
                src={cover.thumb}
                srcSet={cover.srcSet}
                sizes="220px"
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
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b0b14]/70 to-transparent" />
        </>
      )}
    </div>
  );
}
