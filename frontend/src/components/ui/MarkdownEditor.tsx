import { useState, type ReactNode } from "react";
import { Eye, FileCode2, Columns2 } from "lucide-react";
import { FIELD_ERROR_TEXT_CLASS } from "@/components/ui/fieldStyles";
import { useFieldIds } from "@/components/ui/FormField";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";

type MarkdownViewMode = "edit" | "preview" | "split";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  /** Id do textarea, para um <label htmlFor> externo; sem ele usa um aria-label genérico */
  id?: string;
  /** Ids de textos de ajuda ligados ao campo */
  describedBy?: string;
};

type ViewButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
};

function ViewButton({ label, active, onClick, children }: ViewButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand sm:px-3",
        active ? "bg-home-raised text-home-ink" : "text-home-muted hover:bg-home-raised/50 hover:text-home-ink",
      )}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Escreva em markdown…",
  error,
  className,
  id,
  describedBy,
}: MarkdownEditorProps) {
  const { errorId, controlProps } = useFieldIds(id, error, describedBy);
  const isWide = useMediaQuery("(min-width: 768px)");
  const [viewMode, setViewMode] = useState<MarkdownViewMode>("split");

  const effectiveMode: MarkdownViewMode =
    viewMode === "split" && !isWide ? "edit" : viewMode;

  const editorVisible = effectiveMode === "edit" || effectiveMode === "split";
  const previewVisible = effectiveMode === "preview" || effectiveMode === "split";

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div
        className={cn(
          "w-full overflow-hidden rounded-2xl border bg-home-inset",
          error ? "border-danger/50" : "border-home-line",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-home-line px-2 py-2 sm:px-3">
          <div className="flex flex-wrap items-center gap-1">
            <ViewButton
              label="Markdown"
              active={effectiveMode === "edit"}
              onClick={() => setViewMode("edit")}
            >
              <FileCode2 className="size-3.5 shrink-0" aria-hidden />
            </ViewButton>

            <ViewButton
              label="Pré-visualização"
              active={effectiveMode === "preview"}
              onClick={() => setViewMode("preview")}
            >
              <Eye className="size-3.5 shrink-0" aria-hidden />
            </ViewButton>

            {isWide && (
              <ViewButton
                label="Dividido"
                active={effectiveMode === "split"}
                onClick={() => setViewMode("split")}
              >
                <Columns2 className="size-3.5 shrink-0" aria-hidden />
              </ViewButton>
            )}
          </div>

          <span className="text-xs text-home-muted">
            {value.length.toLocaleString("pt-BR")} caracteres
          </span>
        </div>

        <div
          className={cn(
            "grid w-full min-h-[min(52dvh,28rem)] sm:min-h-[min(60dvh,32rem)] lg:min-h-[36rem]",
            editorVisible && previewVisible && "md:grid-cols-2",
          )}
        >
          {/* Sempre montado, só escondido: o <label htmlFor> externo continua apontando para ele */}
          <div
            hidden={!editorVisible}
            className={cn(
              "flex min-h-[min(52dvh,28rem)] flex-col border-home-line sm:min-h-[min(60dvh,32rem)] lg:min-h-[36rem]",
              previewVisible && "md:border-r",
            )}
          >
            <div className="border-b border-home-line px-3 py-1.5 text-xs text-home-muted">Editor</div>
            <textarea
              {...controlProps}
              aria-label={id ? undefined : "Conteúdo em markdown"}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              spellCheck={false}
              className="markdown-editor-textarea min-h-[min(48dvh,24rem)] w-full flex-1 resize-y bg-home-device px-3 py-3 font-mono text-xs leading-relaxed text-home-ink placeholder:text-home-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40 sm:px-4 sm:text-sm lg:min-h-[34rem]"
            />
          </div>

          {previewVisible && (
            <div className="flex min-h-[min(52dvh,28rem)] flex-col bg-home-card sm:min-h-[min(60dvh,32rem)] lg:min-h-[36rem]">
              <div className="border-b border-home-line px-3 py-1.5 text-xs text-home-muted">Pré-visualização</div>
              <div className="min-h-[min(48dvh,24rem)] flex-1 overflow-x-auto overflow-y-auto px-3 py-3 sm:px-5 sm:py-5 lg:min-h-[34rem]">
                {value.trim() ? (
                  <MarkdownContent content={value} className="min-w-0" />
                ) : (
                  <p className="text-sm text-home-muted">A pré-visualização aparece aqui conforme você escreve.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <span id={errorId} className={FIELD_ERROR_TEXT_CLASS}>
          {error}
        </span>
      )}
    </div>
  );
}
