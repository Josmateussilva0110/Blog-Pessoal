import { useMemo } from "react";
import { m } from "motion/react";
import type { Project } from "@blog/shared";
import { usePublicSiteLinks } from "@/features/site-links/hooks/useSiteLinks";
import { countTechUsage } from "@/features/projects/lib/projectStats";
import { Image } from "@/components/ui/Image";
import { RevealText } from "@/components/ui/RevealText";
import { createTechResolver, getSkillIconUrl } from "@/lib/skillicons";
import { fadeUp, inViewRepeat, staggerContainer } from "@/lib/motion";
import { SECTION_IDS } from "@/config/routes";

const GRID_CLASS = "grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2";
const TILE_BASE_CLASS = "flex h-full flex-col items-center gap-2.5 rounded-2xl bg-home-inset px-2 pb-3.5 pt-4.5";
const TILE_CLASS = `group ${TILE_BASE_CLASS} transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-home-raised focus-visible:outline-2 focus-visible:outline-brand`;
const ICON_CLASS = "size-11 rounded-tile";
/** Quantidade de tiles provisórios: perto da lista cadastrada, para a seção não mudar muito de altura */
const SKELETON_TILE_COUNT = 15;

function usageLabel(count: number) {
  if (count === 0) return "";
  return `em ${count} ${count === 1 ? "projeto" : "projetos"}`;
}

function SkillTile({ name, icon, href, usage }: { name: string; icon: string; href?: string; usage: string }) {
  const content = (
    <>
      <Image src={getSkillIconUrl(icon)} alt="" variant="icon" loading="lazy" className={ICON_CLASS} />
      <span className="text-center text-caption font-medium text-home-ink">{name}</span>
      {/* Altura fixa: tiles sem uso não ficam mais baixos que os outros */}
      <span className="min-h-4 font-mono text-2xs leading-4 text-home-muted">{usage}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={TILE_CLASS}>
        {content}
      </a>
    );
  }

  return <div className={TILE_CLASS}>{content}</div>;
}

/** Tiles com as mesmas medidas dos reais (ícone, nome e linha de uso) enquanto a lista carrega */
function SkillsSkeleton() {
  return (
    <>
      <span role="status" className="sr-only">
        Carregando ferramentas…
      </span>
      <ul className={GRID_CLASS} aria-hidden>
        {Array.from({ length: SKELETON_TILE_COUNT }, (_, index) => (
          <li key={index} className={`${TILE_BASE_CLASS} animate-pulse`}>
            <div className={`${ICON_CLASS} bg-home-raised`} />
            {/* Mesma altura de linha do nome real (text-caption com line-height 1.5) */}
            <div className="flex h-[calc(var(--text-caption)*1.5)] items-center">
              <div className="h-3.5 w-14 rounded bg-home-raised" />
            </div>
            <div className="h-4" />
          </li>
        ))}
      </ul>
    </>
  );
}

export function SkillsIconSection({ projects }: { projects: Project[] }) {
  const { data: siteLinks, isPending } = usePublicSiteLinks();
  const skills = siteLinks?.skill;
  // Mesmo resolvedor do useTechMeta, com as skills que esta seção já buscou
  const resolveTech = useMemo(() => createTechResolver(skills), [skills]);
  // Quantos projetos usam cada ferramenta, pelo nome padronizado
  const usage = useMemo(
    () => new Map(countTechUsage(projects, resolveTech).map((tech) => [tech.label, tech.projects.length])),
    [projects, resolveTech],
  );

  // A lista vem só da API: com erro ou sem ferramentas cadastradas, a seção não aparece
  if (!isPending && !skills?.length) return null;

  return (
    <section
      id={SECTION_IDS.skills}
      aria-busy={isPending}
      className="home-card scroll-mt-24 p-5 sm:scroll-mt-28 sm:p-7"
    >
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <RevealText
          text="Ferramentas"
          className="text-xl font-semibold tracking-heading text-home-ink"
        />
        <p className="text-sm text-home-muted">Linguagens, frameworks e serviços que uso no dia a dia</p>
      </div>

      {isPending ? (
        <SkillsSkeleton />
      ) : (
        <m.ul
          className={GRID_CLASS}
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={inViewRepeat}
        >
          {skills?.map((skill) => {
            const icon = skill.icon ?? skill.label.toLowerCase();
            const count = usage.get(resolveTech(skill.label).label) ?? 0;

            return (
              <m.li key={`${icon}-${skill.label}`} variants={fadeUp} whileTap={{ scale: 0.95 }}>
                <SkillTile name={skill.label} icon={icon} href={skill.href} usage={usageLabel(count)} />
              </m.li>
            );
          })}
        </m.ul>
      )}
    </section>
  );
}
