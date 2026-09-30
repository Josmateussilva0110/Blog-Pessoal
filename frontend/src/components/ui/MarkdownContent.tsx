import { type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/format";
import { isMermaidChart, MermaidDiagram } from "@/components/ui/MermaidDiagram";
import { MarkdownCodeBlock } from "@/components/ui/MarkdownCodeBlock";
import { headingId, nodeText } from "@/lib/markdownHeadings";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

type CodeProps = {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
};

function MarkdownCode({ inline, className, children }: CodeProps) {
  const code = String(children ?? "").replace(/\n$/, "");

  if (inline) {
    return (
      <code className="rounded-md bg-accent-soft px-1.5 py-0.5 font-mono text-[0.9em] text-accent">
        {code}
      </code>
    );
  }

  const languageMatch = /language-(\w+)/.exec(className ?? "");
  const language = languageMatch?.[1]?.toLowerCase();

  if (language === "mermaid" || isMermaidChart(code)) {
    return <MermaidDiagram chart={code} className="my-4" />;
  }

  return <MarkdownCodeBlock code={code} language={language} />;
}

function MarkdownPre({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: MarkdownPre,
          code: MarkdownCode,
          // Ids nos títulos para o índice da página poder linkar até eles
          h2: ({ node: _node, children, ...props }) => (
            <h2 id={headingId(nodeText(children))} {...props}>
              {children}
            </h2>
          ),
          h3: ({ node: _node, children, ...props }) => (
            <h3 id={headingId(nodeText(children))} {...props}>
              {children}
            </h3>
          ),
          table: ({ children, ...props }) => (
            <div className="markdown-table-wrap">
              <table {...props}>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
