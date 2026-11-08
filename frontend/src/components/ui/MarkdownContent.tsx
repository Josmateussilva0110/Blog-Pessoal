import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/cn";
import { isMermaidChart, MermaidDiagram } from "@/components/ui/MermaidDiagram";
import { MarkdownCodeBlock } from "@/components/ui/MarkdownCodeBlock";
import { hastText, rehypeHeadingIds } from "@/lib/markdownHeadings";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

const LANGUAGE_CLASS_PREFIX = "language-";

/** Linguagem da cerca (```ts) a partir das classes do <code> */
function getCodeLanguage(className: unknown) {
  const classes = Array.isArray(className) ? className.map(String) : [];
  const languageClass = classes.find((item) => item.startsWith(LANGUAGE_CLASS_PREFIX));
  return languageClass?.slice(LANGUAGE_CLASS_PREFIX.length).toLowerCase();
}

/**
 * Bloco de código: só um <pre> envolve código em bloco. O react-markdown 10 não envia
 * mais a prop `inline` ao <code>, então a decisão bloco/inline fica aqui, pela árvore hast.
 */
const MarkdownPre: Components["pre"] = ({ node, children }) => {
  const codeNode = node?.children[0];

  if (codeNode?.type !== "element" || codeNode.tagName !== "code") {
    return <pre>{children}</pre>;
  }

  const code = hastText(codeNode).replace(/\n$/, "");
  const language = getCodeLanguage(codeNode.properties.className);

  if (language === "mermaid" || isMermaidChart(code)) {
    return <MermaidDiagram chart={code} className="my-4" />;
  }

  return <MarkdownCodeBlock code={code} language={language} />;
};

/** Código inline (`x`): os blocos já foram tratados no <pre> */
const MarkdownInlineCode: Components["code"] = ({ children }) => (
  <code className="rounded-md bg-home-inset px-1.5 py-0.5 font-mono text-[0.9em] text-home-ink">
    {children}
  </code>
);

const markdownComponents: Components = {
  pre: MarkdownPre,
  code: MarkdownInlineCode,
  table: ({ children, node: _node, ...props }) => (
    <div className="markdown-table-wrap">
      <table {...props}>{children}</table>
    </div>
  ),
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // Ids nos títulos para o índice da página poder linkar até eles
        rehypePlugins={[rehypeHeadingIds]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
