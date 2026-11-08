import { useId, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { SiteLinkInput } from "@blog/shared";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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

  // Três editores na mesma página (menu, redes, skills): ids com prefixo próprio
  const fieldsIdPrefix = useId();

  function addItem() {
    onChange([...items, createEmptyItem(showIcon)]);
    setOpenIndex(items.length);
  }

  return (
    <section className="admin-card p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-home-ink">{title}</h2>
          <p className="mt-1 text-sm text-home-muted">{description}</p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={addItem}>
          <Plus className="size-4" aria-hidden />
          Adicionar link
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-home-muted">{emptyLabel}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <article
              key={item.id ?? `link-${index}`}
              className="rounded-2xl border border-home-line p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  aria-expanded={openIndex === index}
                  aria-controls={`${fieldsIdPrefix}-${index}`}
                  className="min-w-0 flex-1 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <p className="truncate text-sm font-medium text-home-ink">{item.label || "Novo link"}</p>
                  {item.href && <p className="mt-1 truncate text-xs text-home-muted">{item.href}</p>}
                </button>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={index === 0}
                    onClick={() => moveItem(index, -1)}
                    aria-label="Mover para cima"
                  >
                    <ArrowUp className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, 1)}
                    aria-label="Mover para baixo"
                  >
                    <ArrowDown className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="danger-ghost"
                    onClick={() => removeItem(index)}
                    aria-label="Remover link"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>

              {/* Só renderiza aberto: campos escondidos com opacity continuariam na ordem do Tab */}
              {openIndex === index && (
                <div id={`${fieldsIdPrefix}-${index}`} className="mt-4 grid gap-3">
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
                    <label className="flex min-h-11 items-center gap-2.5 text-sm text-home-body">
                      <input
                        type="checkbox"
                        checked={item.external ?? false}
                        onChange={(event) => updateItem(index, { external: event.target.checked })}
                        className="size-4 rounded accent-brand"
                      />
                      Abrir em nova aba
                    </label>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
