import { useMemo } from "react";
import { motion } from "motion/react";
import type { Project } from "@blog/shared";
import { DEFAULT_SITE_LINKS } from "@/config/siteLinks.defaults";
import { useSiteLinks } from "@/features/site-links/hooks/useSiteLinks";
import { countTechUsage } from "@/features/projects/lib/projectStats";
import { Image } from "@/components/ui/Image";
import { RevealText } from "@/components/ui/RevealText";
import { getSkillIconUrl, getTechMeta } from "@/lib/skillicons";
import { fadeUp, inViewRepeat, staggerContainer } from "@/lib/motion";
import { SECTION_IDS } from "@/config/routes";

const TILE_CLASS =
  "group flex h-full flex-col items-center gap-2.5 rounded-2xl bg-home-inset px-2 pb-3.5 pt-4.5 transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-home-raised focus-visible:outline-2 focus-visible:outline-brand";

function usageLabel(count: number) {
  if (count === 0) return "";
  return `em ${count} ${count === 1 ? "projeto" : "projetos"}`;
}

function SkillTile({ name, icon, href, usage }: { name: string; icon: string; href?: string; usage: string }) {
  const content = (
    <>
      <Image src={getSkillIconUrl(icon)} alt="" variant="icon" loading="lazy" className="size-11 rounded-[0.625rem]" />
      <span className="text-center text-[13px] font-medium text-home-ink">{name}</span>
      {/* Altura fixa: tiles sem uso não ficam mais baixos que os outros */}
      <span className="min-h-4 font-mono text-[11px] leading-4 text-home-muted">{usage}</span>
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

export function SkillsIconSection({ projects }: { projects: Project[] }) {
  const { data: siteLinks } = useSiteLinks();
  const skills = siteLinks?.skill ?? DEFAULT_SITE_LINKS.skill;
  // Quantos projetos usam cada ferramenta, pelo nome padronizado
  const usage = useMemo(
    () => new Map(countTechUsage(projects).map((tech) => [tech.label, tech.projects.length])),
    [projects],
  );

  return (
    <section id={SECTION_IDS.skills} className="home-card scroll-mt-24 p-5 sm:scroll-mt-28 sm:p-7">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <RevealText
          text="Ferramentas"
          className="text-xl font-semibold tracking-[-0.02em] text-home-ink"
        />
        <p className="text-sm text-home-muted">Linguagens, frameworks e serviços que uso no dia a dia</p>
      </div>

      <motion.ul
        className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={inViewRepeat}
      >
        {skills.map((skill) => {
          const icon = skill.icon ?? skill.label.toLowerCase();
          const count = usage.get(getTechMeta(skill.label).label) ?? 0;

          return (
            <motion.li key={`${icon}-${skill.label}`} variants={fadeUp} whileTap={{ scale: 0.95 }}>
              <SkillTile name={skill.label} icon={icon} href={skill.href} usage={usageLabel(count)} />
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
