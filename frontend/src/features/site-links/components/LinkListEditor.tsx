import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { SiteLinkInput } from "@blog/shared";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/format";

type LinkListEditorProps = {
  title: string;
  description: string;
  items: SiteLinkInput[];
  onChange: (items: SiteLinkInput[]) => void;
  showExternal?: boolean;
  showIcon?: boolean;
  hrefRequired?: boolean;
  emptyLabel?: string;
};

function createEmptyItem(showIcon: boolean): SiteLinkInput {
  return {
    label: "",
    href: "",
    icon: showIcon ? "" : undefined,
    external: false,
  };
}

export function LinkListEditor({
  title,
  description,
  items,
  onChange,
  showExternal = false,
  showIcon = false,
  hrefRequired = true,
  emptyLabel = "Nenhum link cadastrado.",
}: LinkListEditorProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function updateItem(index: number, patch: Partial<SiteLinkInput>) {
    onChange(items.map((item, current) => (current === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, current) => current !== index));
    setOpenIndex(null);
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
    setOpenIndex(target);
  }

  function addItem() {
    onChange([...items, createEmptyItem(showIcon)]);
    setOpenIndex(items.length);
  }

  return (
    <section className="admin-card p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="code-comment mb-1">// {title.toLowerCase()}</p>
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        </div>
        <Button type="button" size="sm" variant="outline" className="font-mono" onClick={addItem}>
          <Plus className="size-4" aria-hidden />
          add_link()
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="font-mono text-xs text-text-subtle">{emptyLabel}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <article
              key={item.id ?? `link-${index}`}
              className="rounded-lg border border-border-subtle bg-surface-raised p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <p className="font-mono text-sm text-text truncate">
                    {item.label || "novo link"}
                  </p>
                  {item.href && (
                    <p className="mt-1 font-mono text-[10px] text-text-subtle truncate">
                      {item.href}
                    </p>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="px-2"
                    disabled={index === 0}
                    onClick={() => moveItem(index, -1)}
                    aria-label="Mover para cima"
                  >
                    <ArrowUp className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="px-2"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, 1)}
                    aria-label="Mover para baixo"
                  >
                    <ArrowDown className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="px-2 text-red-400 hover:text-red-300"
                    onClick={() => removeItem(index)}
                    aria-label="Remover link"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>

              <div
                className={cn(
                  "grid gap-3 overflow-hidden transition-all",
                  openIndex === index ? "mt-4 max-h-[480px] opacity-100" : "max-h-0 opacity-0",
                )}
              >
                <Input
                  label="Rótulo"
                  value={item.label}
                  onChange={(event) => updateItem(index, { label: event.target.value })}
                  placeholder={showIcon ? "React" : "github"}
                />

                {showIcon && (
                  <Input
                    label="Ícone (skillicons.dev)"
                    value={item.icon ?? ""}
                    onChange={(event) => updateItem(index, { icon: event.target.value })}
                    placeholder="react"
                  />
                )}

                <Input
                  label={hrefRequired ? "URL" : "URL (opcional)"}
                  value={item.href ?? ""}
                  onChange={(event) => updateItem(index, { href: event.target.value })}
                  placeholder={showIcon ? "https://react.dev" : "/#projetos"}
                />

                {showExternal && (
                  <label className="flex items-center gap-2 font-mono text-xs text-text-muted">
                    <input
                      type="checkbox"
                      checked={item.external ?? false}
                      onChange={(event) => updateItem(index, { external: event.target.checked })}
                      className="rounded border-border-subtle"
                    />
                    abrir em nova aba
                  </label>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
