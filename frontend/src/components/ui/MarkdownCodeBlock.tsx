import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/cn";

/** Tempo que o botão mostra "Copiado" depois do clique */
const COPIED_FEEDBACK_MS = 2000;

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  md: "markdown",
  html: "jsx",
};

const SUPPORTED_LANGUAGES = new Set([
  "bash",
  "css",
  "go",
  "java",
  "javascript",
  "json",
  "jsx",
  "markdown",
  "python",
  "sql",
  "tsx",
  "typescript",
  "yaml",
]);

SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("go", go);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("yaml", yaml);

// O tema pinta o <code> (inline) com fundo próprio, que aparece atrás de cada
// linha como se o texto estivesse selecionado: o bloco já tem o fundo dele
const CODE_TAG_STYLE = {
  ...oneDark['code[class*="language-"]'],
  background: "transparent",
  textShadow: "none",
};

function normalizeLanguage(language?: string): string | undefined {
  if (!language) return undefined;

  const normalized = language.toLowerCase();
  const resolved = LANGUAGE_ALIASES[normalized] ?? normalized;

  return SUPPORTED_LANGUAGES.has(resolved) ? resolved : undefined;
}

type MarkdownCodeBlockProps = {
  code: string;
  language?: string;
  className?: string;
};

export function MarkdownCodeBlock({
  code,
  language,
  className,
}: MarkdownCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const resolvedLanguage = normalizeLanguage(language);
  const label = resolvedLanguage ?? language ?? "text";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={cn(
        "markdown-code-block my-4 overflow-hidden rounded-xl border border-home-line bg-home-device",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-home-line bg-home-inset/60 px-4 py-2">
        <span className="font-mono text-2xs uppercase tracking-wide text-home-muted">
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-2xs transition-colors focus-visible:outline-2 focus-visible:outline-brand",
            copied
              ? "border-terminal/30 bg-terminal/10 text-terminal"
              : "border-home-line text-home-muted hover:bg-home-inset hover:text-home-ink",
          )}
          aria-label={copied ? "Código copiado" : "Copiar código"}
        >
          {copied ? (
            <>
              <Check className="size-3.5" aria-hidden />
              Copiado
            </>
          ) : (
            <>
              <Copy className="size-3.5" aria-hidden />
              Copiar
            </>
          )}
        </button>
      </div>

      {resolvedLanguage ? (
        <SyntaxHighlighter
          language={resolvedLanguage}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem 1.125rem",
            background: "transparent",
            fontSize: "0.8125rem",
            lineHeight: 1.6,
          }}
          PreTag="div"
          CodeTag="code"
          codeTagProps={{ style: CODE_TAG_STYLE }}
        >
          {code}
        </SyntaxHighlighter>
      ) : (
        <pre className="overflow-x-auto p-4 font-mono text-caption leading-relaxed text-home-ink">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
