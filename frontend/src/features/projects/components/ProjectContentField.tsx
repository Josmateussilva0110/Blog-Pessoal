import { useId, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { LABEL_CLASS } from "@/components/ui/fieldStyles";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { useToast } from "@/components/ui/toast";

type ProjectContentFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

/** "Sobre o projeto": editor de markdown com importação de um arquivo .md */
export function ProjectContentField({ value, onChange, error }: ProjectContentFieldProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorId = useId();
  const helpId = useId();

  async function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Limpa para permitir importar o mesmo arquivo de novo
    event.target.value = "";

    if (!file) return;

    try {
      onChange(await file.text());
      toast.success("Conteúdo importado do arquivo .md.");
    } catch {
      toast.error("Não foi possível ler o arquivo .md.");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={editorId} className={LABEL_CLASS}>
          Sobre o projeto
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,text/markdown"
          className="hidden"
          onChange={handleFileSelection}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          Importar .md
        </Button>
      </div>

      <MarkdownEditor
        id={editorId}
        describedBy={helpId}
        value={value}
        onChange={onChange}
        error={error}
      />
      <p id={helpId} className="text-xs text-home-muted">
        Editor em markdown puro. Use a aba{" "}
        <strong className="font-medium text-home-ink">Pré-visualização</strong> para ver o
        resultado formatado (tabelas, código, diagramas Mermaid). Também é possível{" "}
        <strong className="font-medium text-home-ink">Importar .md</strong>.
      </p>
    </div>
  );
}
