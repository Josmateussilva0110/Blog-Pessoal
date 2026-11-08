import type { ProjectUpdate } from "@blog/shared";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { ROUTES } from "@/config/routes";
import { getUpdateExcerpt, isLongUpdate } from "@/features/projects/lib/projectUpdateContent";
import { cn, formatDate } from "@/lib/format";

export const PROJECT_UPDATES_SECTION_ID = "atualizacoes";

/** Data e versão da atualização (timeline e página própria) */
export function ProjectUpdateMeta({ update }: { update: ProjectUpdate }) {
  return (
    <p className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-home-muted">
      <time dateTime={update.publishedAt}>{formatDate(update.publishedAt)}</time>
      {update.version && (
        <span className="rounded-full bg-brand/15 px-2 py-0.5 normal-case tracking-normal text-brand">
          {update.version}
        </span>
      )}
    </p>
  );
}

type ProjectUpdateItemProps = {
  update: ProjectUpdate;
  projectSlug: string;
  latest: boolean;
};

function ProjectUpdateItem({ update, projectSlug, latest }: ProjectUpdateItemProps) {
  const reducedMotion = useReducedMotion();
  // Longas mostram só a prévia: diagramas e código carregam apenas na página própria
  const isLong = isLongUpdate(update.contentMarkdown);
  const excerpt = isLong ? getUpdateExcerpt(update.contentMarkdown) : "";
  const href = ROUTES.projectUpdate(projectSlug, update.id);

  return (
    <motion.li
      id={`update-${update.id}`}
      className="relative scroll-mt-24 pb-10 pl-8 last:pb-0"
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Marcador da linha do tempo: a mais recente fica preenchida */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1 size-[11px] -translate-x-1/2 rounded-full border-2",
          latest
            ? "border-brand bg-brand shadow-[0_0_0_4px] shadow-brand/15"
            : "border-home-raised bg-home-card",
        )}
      />

      <ProjectUpdateMeta update={update} />

      <h3 className="mt-2 text-lg font-semibold tracking-[-0.01em] text-home-ink">
        {isLong ? (
          <Link to={href} className="transition-colors hover:text-brand">
            {update.title}
          </Link>
        ) : (
          update.title
        )}
      </h3>

      {isLong ? (
        <>
          {excerpt && (
            <p className="mt-3 text-sm leading-relaxed text-home-body">{excerpt}</p>
          )}
          <Link
            to={href}
            className="group mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-home-ink"
          >
            Ler atualização completa
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </>
      ) : (
        update.contentMarkdown && (
          <MarkdownContent
            content={update.contentMarkdown}
            className="project-update-body mt-3 text-sm"
          />
        )
      )}
    </motion.li>
  );
}

type ProjectUpdatesProps = {
  updates: ProjectUpdate[];
  projectSlug: string;
};

/** Linha do tempo das atualizações do projeto, da mais recente para a mais antiga */
export function ProjectUpdates({ updates, projectSlug }: ProjectUpdatesProps) {
  if (updates.length === 0) return null;

  return (
    <section
      aria-labelledby={PROJECT_UPDATES_SECTION_ID}
      className="home-card scroll-mt-24 p-5 sm:scroll-mt-28 sm:p-8"
    >
      <h2
        id={PROJECT_UPDATES_SECTION_ID}
        className="mb-7 flex items-baseline gap-2 text-xl font-semibold tracking-[-0.02em] text-home-ink"
      >
        Atualizações
        <span className="font-mono text-xs font-normal text-home-muted">{updates.length}</span>
      </h2>

      <ol className="relative ml-[5px] border-l border-home-line">
        {updates.map((update, index) => (
          <ProjectUpdateItem
            key={update.id}
            update={update}
            projectSlug={projectSlug}
            latest={index === 0}
          />
        ))}
      </ol>
    </section>
  );
}
