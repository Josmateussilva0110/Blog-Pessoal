import { ChevronDown } from "lucide-react";
import type { MarkdownHeading } from "@/lib/markdownHeadings";
import { ProjectToc } from "./ProjectToc";

/** Índice recolhível do celular; no desktop ele fica fixo na coluna lateral */
export function ProjectMobileToc({ headings }: { headings: MarkdownHeading[] }) {
  return (
    <details className="group mb-8 rounded-xl bg-home-inset">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl px-4 text-sm text-home-ink focus-visible:outline-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
        <span>
          Nesta página
          <span className="ml-2 font-mono text-xs text-home-muted">{headings.length}</span>
        </span>
        <ChevronDown
          className="size-4 text-home-muted transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-home-line px-4 py-3">
        <ProjectToc headings={headings} showTitle={false} />
      </div>
    </details>
  );
}
