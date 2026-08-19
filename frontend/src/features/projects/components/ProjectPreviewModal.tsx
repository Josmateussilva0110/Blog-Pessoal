import { useEffect } from "react";
import { X } from "lucide-react";
import type { ProjectStatus } from "@blog/shared";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { StatusBadge } from "@/features/projects/components/StatusBadge";

export type ProjectPreviewData = {
  title: string;
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Prévia
            </p>
            <p className="text-sm text-zinc-400">
              Assim o projeto aparecerá na página pública.
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            <X className="size-4" aria-hidden />
            Fechar
          </Button>
        </div>

        <article className="glass-strong rounded-3xl p-6 sm:p-8 md:p-10">
          <header className="mb-8 border-b border-white/10 pb-8">
            <div className="mb-4 flex items-center gap-3">
              <StatusBadge status={data.status} />
              <span className="text-xs text-text-subtle">Prévia não publicada</span>
            </div>
            <h1
              id="project-preview-title"
              className="text-3xl font-bold text-text md:text-4xl"
            >
              {title}
            </h1>
          </header>

          {hasContent ? (
            <MarkdownContent content={data.contentMarkdown} className="mb-8" />
          ) : (
            <p className="mb-8 text-sm italic text-text-muted">
              Adicione uma descrição para ver o conteúdo formatado aqui.
            </p>
          )}

          {data.images.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 text-sm font-medium text-accent">Imagens</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.images.map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt={`Captura de ${title}`}
                    className="w-full rounded-2xl border border-white/10 object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {data.techStack.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 text-sm font-medium text-accent">Stack</h2>
              <div className="flex flex-wrap gap-2">
                {data.techStack.map((tech) => (
                  <Badge key={tech} variant="accent">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {data.repoUrl && (
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" type="button" disabled>
                Repositório
              </Button>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
