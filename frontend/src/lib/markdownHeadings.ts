import { isValidElement, type ReactNode } from "react";
import { slugify } from "@/lib/slugify";

export type MarkdownHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

/** Id usado tanto no título renderizado quanto no link do índice */
export function headingId(text: string) {
  return slugify(text);
}

/** Texto puro de um título renderizado pelo react-markdown (pode ter <strong>, <code>…) */
export function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children);
  return "";
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
