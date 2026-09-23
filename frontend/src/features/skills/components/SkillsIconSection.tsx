import { motion } from "motion/react";
import { DEFAULT_SITE_LINKS } from "@/config/siteLinks.defaults";
import { useSiteLinks } from "@/features/site-links/hooks/useSiteLinks";
import { Image } from "@/components/ui/Image";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TerminalWindow } from "@/components/ui/TerminalWindow";
import { getSkillIconUrl } from "@/lib/skillicons";
import { fadeUp, inViewOnce, staggerContainer } from "@/lib/motion";
import { TypingCommand } from "@/components/ui/TypingText";

function SkillCard({
  name,
  icon,
  href,
}: {
  name: string;
  icon: string;
  href?: string;
}) {
  const content = (
    <>
      <Image
        src={getSkillIconUrl(icon)}
        alt={name}
        variant="icon"
        loading="lazy"
      />
      <span className="font-mono text-[10px] text-text-muted text-center leading-tight group-hover:text-accent transition-colors">
        --{name.toLowerCase()}
      </span>
    </>
  );

  const className =
    "group terminal-card-muted p-2.5 sm:p-3 flex flex-col items-center justify-center gap-1.5 sm:gap-2 min-h-[84px] sm:min-h-[96px] transition-all duration-300 hover:bg-accent-soft hover:border-accent/20 hover:-translate-y-0.5";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={name}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={className} title={name}>
      {content}
    </div>
  );
}

export function SkillsIconSection() {
  const { data: siteLinks } = useSiteLinks();
  const skills = siteLinks?.skill ?? DEFAULT_SITE_LINKS.skill;

  return (
    <section id="skills" className="py-12 sm:py-16 md:py-20 scroll-mt-24 sm:scroll-mt-28">
      <SectionHeader
        tag="Tecnologias"
        title="Linguagens & ferramentas"
        subtitle="Stack que utilizo no dia a dia."
      />

      <TerminalWindow path="~/skills" bodyClassName="p-4 sm:p-6 md:p-8">
        <TypingCommand
          className="font-mono text-xs text-text-subtle mb-6"
          command="ls"
          args=" ./tools"
          suffix={` · ${skills.length} packages`}
        />

        <motion.div
          className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3 md:gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
        >
          {skills.map((skill) => (
            <motion.div
              key={`${skill.icon}-${skill.label}`}
              variants={fadeUp}
              whileTap={{ scale: 0.95 }}
              className="grid"
            >
              <SkillCard
                name={skill.label}
                icon={skill.icon ?? skill.label.toLowerCase()}
                href={skill.href}
              />
            </motion.div>
          ))}
        </motion.div>
      </TerminalWindow>
    </section>
  );
}
