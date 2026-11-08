import { getSkillIconUrl, getTechMeta } from "@/lib/skillicons";

/** Stack do projeto na coluna lateral, com o ícone de cada tecnologia */
export function ProjectStackCard({ techStack }: { techStack: string[] }) {
  // "node.js" e "nodejs" viram a mesma linha
  const techs = [...new Map(techStack.map(getTechMeta).map((meta) => [meta.label, meta])).values()];

  if (techs.length === 0) return null;

  return (
    <section aria-labelledby="project-stack" className="home-card p-5">
      <h2 id="project-stack" className="mb-3.5 text-sm font-semibold text-home-ink">
        Stack
      </h2>
      <ul className="flex flex-col gap-1.5">
        {techs.map((tech) => (
          <li key={tech.label} className="flex items-center gap-3 rounded-xl bg-home-inset px-3 py-2.5">
            {tech.icon ? (
              <img
                src={getSkillIconUrl(tech.icon)}
                alt=""
                width={26}
                height={26}
                loading="lazy"
                className="size-[1.625rem] rounded-md"
              />
            ) : (
              <span
                aria-hidden
                className="flex size-[1.625rem] items-center justify-center rounded-md bg-home-raised text-xs font-semibold text-home-muted"
              >
                {tech.label.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-sm font-medium text-home-ink">{tech.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
