import { useEffect } from "react";
import { X } from "lucide-react";
import type { ProjectStatus } from "@blog/shared";
import { Button } from "@/components/ui/Button";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { StatusBadge } from "@/features/projects/components/StatusBadge";

export type ProjectPreviewData = {
  title: string;
  description: string;
  contentMarkdown: string;
  status: ProjectStatus;
  techStack: string[];
  repoUrl?: string;
  images: string[];
};

type ProjectPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  data: ProjectPreviewData;
};

export function ProjectPreviewModal({ open, onClose, data }: ProjectPreviewModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const title = data.title.trim() || "Título do projeto";
  const summary = data.description.trim();
  const hasContent = data.contentMarkdown.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <button
        type="button"
        className="fixed inset-0 bg-black/70 backdrop-blur-[2px]"
        aria-label="Fechar prévia"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-preview-title"
        className="relative w-full max-w-3xl"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="code-comment mb-1">// preview</p>
            <p className="text-sm text-text-muted">
              Assim o projeto aparecerá na página pública.
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" className="font-mono" onClick={onClose}>
            <X className="size-4" aria-hidden />
            close()
          </Button>
        </div>

        <article className="terminal-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border-subtle bg-surface-raised">
            <span className="h-2 w-2 rounded-full bg-red-500/80" />
            <span className="h-2 w-2 rounded-full bg-amber-400/80" />
            <span className="h-2 w-2 rounded-full bg-terminal/80" />
            <span className="font-mono text-[10px] ml-1 text-text-subtle">
              $ preview --project
            </span>
          </div>

          <div className="p-6 sm:p-8 md:p-10">
            <header className="mb-8 border-b border-border-subtle pb-8">
              <div className="mb-4 flex items-center gap-3">
                <StatusBadge status={data.status} />
                <span className="font-mono text-[10px] text-text-subtle">
                  // draft — not published
                </span>
              </div>
              <h1
                id="project-preview-title"
                className="text-3xl font-bold text-text md:text-4xl"
              >
                {title}
              </h1>
              {summary && (
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  {summary}
                </p>
              )}
            </header>

            {hasContent ? (
              <MarkdownContent content={data.contentMarkdown} className="mb-8" />
            ) : (
              <p className="mb-8 font-mono text-sm italic text-text-muted">
                // adicione uma descrição para ver o conteúdo formatado
              </p>
            )}

            {data.images.length > 0 && (
              <div className="mb-8">
                <p className="code-comment mb-3">// images</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.images.map((image) => (
                    <img
                      key={image}
                      src={image}
                      alt={`Captura de ${title}`}
                      className="w-full rounded-lg border border-border-subtle object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            {data.techStack.length > 0 && (
              <div className="mb-8">
                <p className="code-comment mb-3">// stack</p>
                <div className="flex flex-wrap gap-2">
                  {data.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono text-[10px] text-accent/80 bg-accent-soft border border-accent/20 px-2 py-0.5 rounded"
                    >
                      --{tech.toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.repoUrl && (
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" type="button" disabled className="font-mono">
                  github
                </Button>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
