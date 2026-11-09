import { useState } from "react";
import type { HomeProjects, Project } from "@blog/shared";
import { AnimatePresence, m } from "motion/react";
import { ErrorState } from "@/components/ui/ErrorState";
import { RevealText } from "@/components/ui/RevealText";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ProjectCardItem, ProjectSelectItem } from "@/features/projects/components/ProjectListItem";
import { ProjectSpotlight } from "@/features/projects/components/ProjectSpotlight";
import {
  buildProjectFilters,
  filterProjects,
  type ProjectFilterId,
} from "@/features/projects/lib/projectFilters";
import { cn } from "@/lib/cn";
import { EASE_OUT, fadeUp, staggerContainer, useInViewReveal } from "@/lib/motion";
import { SECTION_IDS } from "@/config/routes";
import { DESKTOP_MEDIA_QUERY } from "@/config/constants";

interface ProjectsSectionProps {
  home?: HomeProjects;
  isLoading: boolean;
  isError: boolean;
  isRetrying: boolean;
  onRetry: () => void;
}

function ProjectsSkeleton() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row" aria-hidden>
      <div className="flex flex-col gap-2 lg:w-[22rem]">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-[0.875rem] bg-home-inset" />
        ))}
      </div>
      <div className="hidden h-[27.5rem] flex-1 animate-pulse rounded-[1.25rem] bg-home-inset lg:block" />
    </div>
  );
}

interface ProjectListProps {
  projects: Project[];
  selectedSlug?: string;
  /** Desktop: lista que seleciona o projeto; celular e tablet: carrossel de cards que abrem o projeto */
  selectable: boolean;
  onSelect: (slug: string) => void;
}

/** Componente próprio para o observador de visibilidade nascer junto com a lista, depois do carregamento */
function ProjectList({ projects, selectedSlug, selectable, onSelect }: ProjectListProps) {
  const reveal = useInViewReveal<HTMLUListElement>();

  return (
    <m.ul
      ref={reveal.ref}
      variants={staggerContainer}
      initial={reveal.initial}
      animate={reveal.animate}
      className={
        selectable
          ? "flex flex-col gap-1 lg:w-[22rem] lg:shrink-0"
          : // Encosta nas bordas do card para o próximo item aparecer cortado e indicar que dá para arrastar
            "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none] sm:-mx-7 sm:scroll-px-7 sm:px-7 [&::-webkit-scrollbar]:hidden"
      }
    >
      {projects.map((project) => (
        <m.li
          key={project.id}
          variants={fadeUp}
          className={selectable ? undefined : "w-[78%] max-w-[20rem] shrink-0 snap-start sm:w-[45%]"}
        >
          {selectable ? (
            <ProjectSelectItem
              project={project}
              selected={project.slug === selectedSlug}
              onSelect={() => onSelect(project.slug)}
            />
          ) : (
            <ProjectCardItem project={project} />
          )}
        </m.li>
      ))}
    </m.ul>
  );
}

export function ProjectsSection({
  home,
  isLoading,
  isError,
  isRetrying,
  onRetry,
}: ProjectsSectionProps) {
  // No celular não há painel de detalhe: cada linha abre o projeto
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const [filter, setFilter] = useState<ProjectFilterId>("spotlight");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const filters = home ? buildProjectFilters(home) : [];
  // Sem destaques cadastrados, o filtro escolhido pode não existir
  const activeFilter = filters.some((item) => item.id === filter) ? filter : (filters[0]?.id ?? "all");
  const visible = home ? filterProjects(home, activeFilter) : [];
  const selected = visible.find((project) => project.slug === selectedSlug) ?? visible[0];

  const heading =
    activeFilter !== "spotlight"
      ? "Projetos"
      : home?.spotlightMode === "featured"
        ? "Projetos em destaque"
        : "Projetos recentes";

  return (
    <section
      id={SECTION_IDS.projects}
      className="home-card scroll-mt-24 p-4 sm:scroll-mt-28 sm:p-7"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-6 sm:gap-4">
        <RevealText
          text={heading}
          className="text-2xl font-semibold tracking-[-0.03em] text-home-ink sm:text-[1.75rem]"
        />

        {filters.length > 1 && (
          <div
            role="group"
            aria-label="Filtrar projetos"
            className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-home-inset p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filters.map((item) => {
              const active = item.id === activeFilter;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[0.5625rem] px-3 text-sm sm:px-3.5 font-medium text-home-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand",
                    active ? "bg-home-raised shadow-control" : "hover:bg-home-raised/50",
                  )}
                >
                  {item.label}
                  <span className="font-mono text-xs text-home-muted">{item.count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isLoading ? (
        <ProjectsSkeleton />
      ) : isError && !home ? (
        <ErrorState
          message="Não foi possível carregar os projetos."
          onRetry={onRetry}
          isRetrying={isRetrying}
        />
      ) : visible.length === 0 ? (
        <p className="text-sm text-home-muted">Nenhum projeto publicado ainda.</p>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          <ProjectList
            projects={visible}
            selectedSlug={selected?.slug}
            selectable={isDesktop}
            onSelect={setSelectedSlug}
          />

          {isDesktop && selected && (
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={selected.slug}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                >
                  <ProjectSpotlight project={selected} />
                </m.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
