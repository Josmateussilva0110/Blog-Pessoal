import { useState, type ReactNode } from "react";
import { Eye, FileCode2, Columns2 } from "lucide-react";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/format";

type MarkdownViewMode = "edit" | "preview" | "split";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
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
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[11px] transition-colors sm:px-3",
        active
          ? "border border-accent/25 bg-accent-soft text-accent"
          : "text-text-muted hover:bg-surface-raised hover:text-text",
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
  placeholder = "Escreva em markdown...",
  error,
  className,
}: MarkdownEditorProps) {
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
          "w-full overflow-hidden rounded-lg border bg-surface-raised/80",
          error ? "border-red-400/40" : "border-border-subtle",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-surface-raised px-2 py-2 sm:px-3">
          <div className="flex flex-wrap items-center gap-1">
            <ViewButton
              label="Markdown"
              active={effectiveMode === "edit"}
              onClick={() => setViewMode("edit")}
            >
              <FileCode2 className="size-3.5 shrink-0" aria-hidden />
            </ViewButton>

            <ViewButton
              label="Preview"
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

          <span className="font-mono text-[10px] text-text-subtle">
            {value.length.toLocaleString("pt-BR")} chars
          </span>
        </div>

        <div
          className={cn(
            "grid w-full min-h-[min(52dvh,28rem)] sm:min-h-[min(60dvh,32rem)] lg:min-h-[36rem]",
            editorVisible && previewVisible && "md:grid-cols-2",
          )}
        >
          {editorVisible && (
            <div
              className={cn(
                "flex min-h-[min(52dvh,28rem)] flex-col border-border-subtle sm:min-h-[min(60dvh,32rem)] lg:min-h-[36rem]",
                previewVisible && "md:border-r",
              )}
            >
              <div className="border-b border-border-subtle px-3 py-1.5 font-mono text-[10px] text-text-subtle">
                content.md
              </div>
              <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                spellCheck={false}
                className="markdown-editor-textarea min-h-[min(48dvh,24rem)] w-full flex-1 resize-y bg-[#06060c] px-3 py-3 font-mono text-xs leading-relaxed text-text placeholder:text-text-subtle focus:outline-none sm:px-4 sm:text-sm lg:min-h-[34rem]"
              />
            </div>
          )}

          {previewVisible && (
            <div className="flex min-h-[min(52dvh,28rem)] flex-col bg-surface sm:min-h-[min(60dvh,32rem)] lg:min-h-[36rem]">
              <div className="border-b border-border-subtle px-3 py-1.5 font-mono text-[10px] text-text-subtle">
                preview.render()
              </div>
              <div className="min-h-[min(48dvh,24rem)] flex-1 overflow-x-auto overflow-y-auto px-3 py-3 sm:px-5 sm:py-5 lg:min-h-[34rem]">
                {value.trim() ? (
                  <MarkdownContent content={value} className="min-w-0" />
                ) : (
                  <p className="font-mono text-xs text-text-subtle sm:text-sm">
                    // o preview aparece aqui conforme você escreve
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
