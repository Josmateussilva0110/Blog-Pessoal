import { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/format";
import { isMermaidChart, MermaidDiagram } from "@/components/ui/MermaidDiagram";

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
      <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[0.9em] text-zinc-100">
        {code}
      </code>
    );
  }

  const languageMatch = /language-(\w+)/.exec(className ?? "");
  const language = languageMatch?.[1]?.toLowerCase();

  if (language === "mermaid" || isMermaidChart(code)) {
    return <MermaidDiagram chart={code} className="my-4" />;
  }

  return <code className="text-sm text-zinc-200 whitespace-pre-wrap">{code}</code>;
}

function MarkdownPre({ children }: { children?: ReactNode }) {
  if (isValidElement(children)) {
    const childProps = children.props as CodeProps;
    const code = String(childProps.children ?? "").replace(/\n$/, "");
    const languageMatch = /language-(\w+)/.exec(childProps.className ?? "");
    const language = languageMatch?.[1]?.toLowerCase();

    if (language === "mermaid" || isMermaidChart(code)) {
      return <>{children}</>;
    }
  }

  return (
    <pre className="my-4 overflow-x-auto rounded-xl border border-white/[0.08] bg-black/30 p-4">
      {children}
    </pre>
  );
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: MarkdownPre,
          code: MarkdownCode,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
