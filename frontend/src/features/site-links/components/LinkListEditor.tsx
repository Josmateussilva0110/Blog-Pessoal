import { useId, useState } from "react";
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { UpdateSiteLinksFormInput } from "@blog/shared";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type LinkListName = keyof UpdateSiteLinksFormInput;
type LinkListErrors = FieldErrors<UpdateSiteLinksFormInput>[LinkListName];

type LinkListEditorProps = {
  name: LinkListName;
  control: Control<UpdateSiteLinksFormInput>;
  register: UseFormRegister<UpdateSiteLinksFormInput>;
  errors?: LinkListErrors;
  title: string;
  description: string;
  showExternal?: boolean;
  showIcon?: boolean;
  hrefRequired?: boolean;
  emptyLabel?: string;
};

function createEmptyItem(showIcon: boolean) {
  const item = { label: "", href: "", external: false };
  return showIcon ? { ...item, icon: "" } : item;
}

/** Lista editável de uma categoria de links (menu, redes ou skills) dentro do SiteLinksForm */
export function LinkListEditor({
  name,
  control,
  register,
  errors,
  title,
  description,
  showExternal = false,
  showIcon = false,
  hrefRequired = true,
  emptyLabel = "Nenhum link cadastrado.",
}: LinkListEditorProps) {
  // keyName próprio: o padrão "id" se confundiria com o id do link vindo da API
  const { fields, append, remove, move } = useFieldArray({ control, name, keyName: "fieldKey" });
  const items = useWatch({ control, name });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Três editores na mesma página (menu, redes, skills): ids com prefixo próprio
  const fieldsIdPrefix = useId();

  function removeItem(index: number) {
    remove(index);
    setOpenIndex(null);
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    move(index, target);
    setOpenIndex(target);
  }

  function addItem() {
    append(createEmptyItem(showIcon));
    setOpenIndex(fields.length);
  }

  return (
    <section className="admin-card p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-heading text-home-ink">{title}</h2>
          <p className="mt-1 text-sm text-home-muted">{description}</p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={addItem}>
          <Plus className="size-4" aria-hidden />
          Adicionar link
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-home-muted">{emptyLabel}</p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const item = items?.[index] ?? field;
            const itemErrors = errors?.[index];
            // Item com erro fica aberto para o campo inválido aparecer
            const isOpen = openIndex === index || Boolean(itemErrors);
            const panelId = `${fieldsIdPrefix}-${index}`;

            return (
              <article key={field.fieldKey} className="rounded-2xl border border-home-line p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
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
                      disabled={index === fields.length - 1}
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
                {isOpen && (
                  <div id={panelId} className="mt-4 grid gap-3">
                    <Input
                      label="Rótulo"
                      placeholder={showIcon ? "React" : "github"}
                      error={itemErrors?.label?.message}
                      {...register(`${name}.${index}.label`)}
                    />

                    {showIcon && (
                      <Input
                        label="Ícone (skillicons.dev)"
                        placeholder="react"
                        error={itemErrors?.icon?.message}
                        {...register(`${name}.${index}.icon`)}
                      />
                    )}

                    <Input
                      label={hrefRequired ? "URL" : "URL (opcional)"}
                      placeholder={showIcon ? "https://react.dev" : "/#projetos"}
                      error={itemErrors?.href?.message}
                      {...register(`${name}.${index}.href`)}
                    />

                    {showExternal && (
                      <label className="flex min-h-11 items-center gap-2.5 text-sm text-home-body">
                        <input
                          type="checkbox"
                          className="size-4 rounded accent-brand"
                          {...register(`${name}.${index}.external`)}
                        />
                        Abrir em nova aba
                      </label>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
