import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { MarkdownHeading } from "@/lib/markdownHeadings";
import { cn } from "@/lib/format";

/** Linha de leitura: fração da altura da tela a partir do topo */
const READING_LINE = 0.35;
/** Tempo sem eventos de scroll para considerar que o scroll do clique terminou */
const CLICK_SCROLL_IDLE_MS = 150;

/**
 * Seção atual: o último título que já passou da linha de leitura.
 * No fim da página, títulos que nunca chegam à linha passam a contar
 * conforme ficam visíveis, para as últimas seções também serem marcadas.
 */
function findActiveHeading(headings: MarkdownHeading[]) {
  const viewport = window.innerHeight;
  const line = viewport * READING_LINE;
  const atBottom =
    window.scrollY + viewport >= document.documentElement.scrollHeight - 4;

  let current = headings[0].id;
  for (const { id } of headings) {
    const top = document.getElementById(id)?.getBoundingClientRect().top;
    if (top === undefined) continue;
    if (top <= line || (atBottom && top < viewport)) current = id;
  }
  return current;
}

function useActiveHeading(headings: MarkdownHeading[]) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);
  // Durante o scroll de um clique no índice, mantém marcado o título clicado
  const clickedIdRef = useRef<string | null>(null);
  const idleTimerRef = useRef(0);

  useEffect(() => {
    if (headings.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      if (clickedIdRef.current) return;
      setActiveId(findActiveHeading(headings));
    };
    const onScroll = () => {
      if (clickedIdRef.current) {
        // Libera a detecção quando o scroll suave parar
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = window.setTimeout(() => {
          clickedIdRef.current = null;
        }, CLICK_SCROLL_IDLE_MS);
        return;
      }
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(idleTimerRef.current);
      cancelAnimationFrame(frame);
    };
  }, [headings]);

  function selectHeading(id: string) {
    clickedIdRef.current = id;
    setActiveId(id);
    // Sem scroll (título já no lugar), libera logo
    window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      clickedIdRef.current = null;
    }, CLICK_SCROLL_IDLE_MS * 4);
  }

  return { activeId, selectHeading };
}

export function ProjectToc({
  headings,
  showTitle = true,
}: {
  headings: MarkdownHeading[];
  showTitle?: boolean;
}) {
  const { activeId, selectHeading } = useActiveHeading(headings);

  function handleClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    selectHeading(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav aria-label="Nesta página">
      {showTitle && (
        <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-text-subtle">
          Nesta página
        </p>
      )}
      <ul className="space-y-0.5 border-l border-hairline">
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
