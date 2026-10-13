import { stripInlineMarkdown } from "@/lib/markdownHeadings";

/** Acima disso o texto deixa de caber bem na linha do tempo */
const LONG_UPDATE_CHARS = 600;
const EXCERPT_MAX_CHARS = 220;

/**
 * Atualização longa ganha página própria: tem títulos, código/diagramas
 * ou texto grande demais para expandir dentro da linha do tempo.
 */
export function isLongUpdate(markdown: string): boolean {
  return (
    markdown.length > LONG_UPDATE_CHARS ||
    /^\s*#{2,3}\s/m.test(markdown) ||
    /^\s*(```|~~~)/m.test(markdown)
  );
}

/** Primeiro parágrafo em texto puro, usado como prévia na linha do tempo */
export function getUpdateExcerpt(markdown: string): string {
  let inFence = false;
  const paragraph: string[] = [];

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();

    if (/^(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    // Linha em branco encerra o parágrafo já encontrado
    if (!line) {
      if (paragraph.length > 0) break;
      continue;
    }

    // Títulos, listas, citações, tabelas e imagens não entram na prévia
    if (/^(#|[-*+]\s|\d+\.\s|>|\||!\[)/.test(line)) {
      if (paragraph.length > 0) break;
      continue;
    }

    paragraph.push(line);
  }

  const text = stripInlineMarkdown(paragraph.join(" "));
  if (text.length <= EXCERPT_MAX_CHARS) return text;

  return `${text.slice(0, EXCERPT_MAX_CHARS).replace(/\s+\S*$/, "")}…`;
}
