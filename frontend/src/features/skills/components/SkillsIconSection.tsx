import { SKILLS } from "@/config/skills";
import { Image } from "@/components/ui/Image";
import { getSkillIconUrl } from "@/lib/skillicons";
import { SectionHeader } from "@/components/ui/SectionHeader";

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
      <span className="text-[11px] text-text-muted text-center leading-tight group-hover:text-accent transition-colors">
        {name}
      </span>
    </>
  );

  const className =
    "group glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 min-h-[100px] transition-all duration-300 hover:bg-blue-500/5 hover:border-blue-400/25 hover:-translate-y-0.5";

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

  return (
    <section id="skills" className="py-16 md:py-20 scroll-mt-28">
      <SectionHeader
        tag="Tecnologias"
        title="Linguagens & ferramentas"
        subtitle="Stack que utilizo no dia a dia."
      />

      <div className="glass-strong rounded-3xl overflow-hidden relative">
        <div className="chart-panel-shine" aria-hidden />
        <div className="relative p-6 md:p-8">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
            {SKILLS.map((skill) => (
              <SkillCard
                key={`${skill.icon}-${skill.name}`}
                name={skill.name}
                icon={skill.icon}
                href={skill.href}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
