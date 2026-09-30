import { slugify } from "@/lib/slugify";

export type MarkdownHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

/** Prefixo evita colisão com ids da própria página (ex.: "documentacao") */
const HEADING_ID_PREFIX = "doc-";

/**
 * Gera ids únicos na ordem dos títulos: repetidos ganham sufixo (-1, -2…).
 * Usado tanto no título renderizado quanto no link do índice, então os dois
 * lados precisam percorrer os títulos na mesma ordem com um slugger novo.
 */
export function createHeadingSlugger() {
  const counts = new Map<string, number>();

  return (text: string) => {
    const base = HEADING_ID_PREFIX + (slugify(text) || "secao");
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

/** Subconjunto da árvore hast que o plugin precisa ler */
type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

/** Texto puro de um nó (títulos podem ter <strong>, <code>…) */
function hastText(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(hastText).join("");
}

/**
 * Plugin rehype: coloca ids únicos nos <h2>/<h3> para o índice linkar até eles.
 * Roda uma vez sobre a árvore inteira, na mesma ordem do extractHeadings
 * (fazer isso nos componentes quebraria com o render duplo do StrictMode).
 */
export function rehypeHeadingIds() {
  return (tree: HastNode) => {
    const headingId = createHeadingSlugger();

    const visit = (node: HastNode) => {
      if (node.type === "element" && (node.tagName === "h2" || node.tagName === "h3")) {
        node.properties = { ...node.properties, id: headingId(hastText(node)) };
        return;
      }
      node.children?.forEach(visit);
    };

    visit(tree);
  };
}

function stripInlineMarkdown(text: string) {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+#+\s*$/, "")
    .trim();
}

/** Títulos de nível 2 e 3 do markdown, ignorando os que estão dentro de blocos de código */
export function extractHeadings(markdown: string): MarkdownHeading[] {
  const headings: MarkdownHeading[] = [];
  const headingId = createHeadingSlugger();
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    const text = stripInlineMarkdown(match[2]);
    if (!text) continue;

    headings.push({ id: headingId(text), text, level: match[1].length as 2 | 3 });
  }

  return headings;
}
