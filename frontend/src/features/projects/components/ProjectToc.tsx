import { useEffect, useState, type MouseEvent } from "react";
import type { MarkdownHeading } from "@/lib/markdownHeadings";
import { cn } from "@/lib/format";

/** Distância do topo (abaixo do header fixo) a partir da qual um título conta como "atual" */
const ACTIVE_OFFSET = 140;

function useActiveHeading(headings: MarkdownHeading[]) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (headings.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      let current = headings[0].id;
      for (const { id } of headings) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= ACTIVE_OFFSET) current = id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [headings]);

  return activeId;
}

export function ProjectToc({
  headings,
  showTitle = true,
}: {
  headings: MarkdownHeading[];
  showTitle?: boolean;
}) {
  const activeId = useActiveHeading(headings);

  function handleClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav aria-label="Nesta página">
      {showTitle && (
        <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-text-subtle">
          Nesta página
        </p>
      )}
      <ul className="space-y-0.5 border-l border-white/[0.08]">
        {headings.map((heading) => {
          const isActive = heading.id === activeId;

          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(event) => handleClick(event, heading.id)}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-1.5 text-[13px] leading-snug transition-colors lg:py-1",
                  heading.level === 3 ? "pl-6" : "pl-3",
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-text-muted hover:text-text",
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
