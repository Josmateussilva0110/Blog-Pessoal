import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Workflow,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/format";

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md border font-mono text-text-muted transition-colors",
        "border-transparent hover:border-accent/20 hover:bg-accent-soft hover:text-text",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active && "border-accent/25 bg-accent-soft text-accent",
      )}
    >
      {children}
    </button>
  );
}

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Descreva o contexto, desafios, solução e resultados...",
  error,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-accent underline underline-offset-2",
        },
      }),
      Placeholder.configure({ placeholder }),
      Markdown,
    ],
    content: value,
    contentType: "markdown",
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getMarkdown());
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor min-h-48 px-4 py-3 text-sm text-text focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentValue = editor.getMarkdown();
    if (value !== currentValue) {
      editor.commands.setContent(value || "", {
        contentType: "markdown",
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  function setLink() {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL do link", previousUrl ?? "https://");

    if (url === null) return;

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  function insertMermaidDiagram() {
    if (!editor) return;

    editor.commands.insertContent(
      `\`\`\`mermaid
sequenceDiagram
    participant C as Frontend
    participant API as Backend
    participant DB as PostgreSQL

    C->>API: POST /register ou /login
    API->>API: Rate limit (10 req / 15 min)
    API->>DB: Validar credenciais / criar usuário
    API->>API: regenerateSession() (anti-fixação)
    API->>API: session.user = { id, username }
    API->>API: saveRotatedCsrfToken()
    API-->>C: { id, username, csrfToken } + Set-Cookie

    Note over C,API: Requisições seguintes
    C->>API: Cookie connect.sid (httpOnly, sameSite=strict, 5 dias)
    C->>API: X-CSRF-Token em POST/PUT/DELETE
\`\`\`

`,
      { contentType: "markdown" },
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-surface-raised/80",
          error ? "border-red-400/40" : "border-border-subtle",
        )}
      >
        {editor && (
          <div className="flex flex-wrap items-center gap-1 border-b border-border-subtle bg-surface-raised px-2 py-2">
            <ToolbarButton
              label="Negrito"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="size-4" aria-hidden />
            </ToolbarButton>

            <ToolbarButton
              label="Itálico"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="size-4" aria-hidden />
            </ToolbarButton>

            <ToolbarButton
              label="Sublinhado"
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="size-4" aria-hidden />
            </ToolbarButton>

            <ToolbarButton
              label="Tachado"
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="size-4" aria-hidden />
            </ToolbarButton>

            <span className="mx-1 h-6 w-px bg-border-subtle" aria-hidden />

            <ToolbarButton
              label="Título 2"
              active={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="size-4" aria-hidden />
            </ToolbarButton>

            <ToolbarButton
              label="Título 3"
              active={editor.isActive("heading", { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 className="size-4" aria-hidden />
            </ToolbarButton>

            <span className="mx-1 h-6 w-px bg-border-subtle" aria-hidden />

            <ToolbarButton
              label="Lista com marcadores"
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="size-4" aria-hidden />
            </ToolbarButton>

            <ToolbarButton
              label="Lista numerada"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="size-4" aria-hidden />
            </ToolbarButton>

            <ToolbarButton
              label="Citação"
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="size-4" aria-hidden />
            </ToolbarButton>

            <ToolbarButton
              label="Link"
              active={editor.isActive("link")}
              onClick={setLink}
            >
              <Link2 className="size-4" aria-hidden />
            </ToolbarButton>

            <ToolbarButton label="Diagrama Mermaid" onClick={insertMermaidDiagram}>
              <Workflow className="size-4" aria-hidden />
            </ToolbarButton>

            <span className="mx-1 h-6 w-px bg-border-subtle" aria-hidden />

            <ToolbarButton
              label="Desfazer"
              disabled={!editor.can().chain().focus().undo().run()}
              onClick={() => editor.chain().focus().undo().run()}
            >
              <Undo2 className="size-4" aria-hidden />
            </ToolbarButton>

            <ToolbarButton
              label="Refazer"
              disabled={!editor.can().chain().focus().redo().run()}
              onClick={() => editor.chain().focus().redo().run()}
            >
              <Redo2 className="size-4" aria-hidden />
            </ToolbarButton>
          </div>
        )}

        <EditorContent editor={editor} />
      </div>

      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
