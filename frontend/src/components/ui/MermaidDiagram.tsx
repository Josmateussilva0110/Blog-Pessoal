import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/format";

type MermaidDiagramProps = {
  chart: string;
  className?: string;
};

const MERMAID_START =
  /^(sequenceDiagram|flowchart|graph|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment)/;

export function isMermaidChart(code: string) {
  return MERMAID_START.test(code.trim());
}

let mermaidInitialized = false;

async function renderMermaidChart(id: string, chart: string) {
  const { default: mermaid } = await import("mermaid");

  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "strict",
      fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
    });
    mermaidInitialized = true;
  }

  return mermaid.render(id, chart);
}

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const baseId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setSvg(null);
      setError(null);

      try {
        const { svg: renderedSvg } = await renderMermaidChart(
          `mermaid-${baseId}`,
          chart.trim(),
        );

        if (!cancelled) {
          setSvg(renderedSvg);
        }
      } catch (renderError) {
        if (!cancelled) {
          setError(
            renderError instanceof Error
              ? renderError.message
              : "Não foi possível renderizar o diagrama.",
          );
        }
      }
    }

    void render();

    return () => {
      cancelled = true;
    };
  }, [baseId, chart]);

  if (error) {
    return (
      <div
        className={cn(
          "rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200",
          className,
        )}
      >
        <p className="font-medium mb-2">Erro no diagrama Mermaid</p>
        <pre className="overflow-x-auto text-xs text-red-100/90 whitespace-pre-wrap">
          {chart}
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div
        className={cn(
          "rounded-lg border border-border-subtle bg-surface-raised p-6 font-mono text-sm text-text-subtle animate-pulse",
          className,
        )}
      >
        Renderizando diagrama...
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mermaid-diagram overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.02] p-4",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
