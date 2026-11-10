import {
  projectUpdateFormSchema,
  type ProjectUpdate,
  type ProjectUpdateFormInput,
  type ProjectUpdateFormValues,
} from "@blog/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LABEL_CLASS } from "@/components/ui/fieldStyles";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { dateInputToIso, toDateInputValue } from "@/lib/format";

type ProjectUpdateFormProps = {
  update?: ProjectUpdate;
  isSaving: boolean;
  onSubmit: (values: ProjectUpdateFormValues) => void;
  onCancel: () => void;
};

function toFormValues(update?: ProjectUpdate): ProjectUpdateFormInput {
  return {
    title: update?.title ?? "",
    version: update?.version ?? "",
    contentMarkdown: update?.contentMarkdown ?? "",
    publishedAt: update?.publishedAt ?? new Date().toISOString(),
  };
}

/** Formulário de uma atualização do projeto (criar ou editar) */
export function ProjectUpdateForm({ update, isSaving, onSubmit, onCancel }: ProjectUpdateFormProps) {
  const contentEditorId = useId();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProjectUpdateFormInput, unknown, ProjectUpdateFormValues>({
    resolver: zodResolver(projectUpdateFormSchema),
    defaultValues: toFormValues(update),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-2xl border border-home-line p-4 sm:p-5"
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_140px_170px]">
        <Input
          id="update-title"
          label="Título"
          placeholder="Novo dashboard de métricas"
          error={errors.title?.message}
          {...register("title")}
        />
        <Input
          id="update-version"
          label="Versão (opcional)"
          placeholder="v1.2.0"
          error={errors.version?.message}
          {...register("version")}
        />
        <Controller
          name="publishedAt"
          control={control}
          render={({ field }) => (
            <Input
              id="update-published-at"
              label="Data"
              type="date"
              value={toDateInputValue(field.value)}
              error={errors.publishedAt?.message}
              onChange={(event) =>
                event.target.value && field.onChange(dateInputToIso(event.target.value))
              }
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={contentEditorId} className={LABEL_CLASS}>
          O que mudou
        </label>
        <Controller
          name="contentMarkdown"
          control={control}
          render={({ field }) => (
            <MarkdownEditor
              id={contentEditorId}
              value={field.value}
              onChange={field.onChange}
              error={errors.contentMarkdown?.message}
            />
          )}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? "Salvando..." : update ? "Salvar atualização" : "Publicar atualização"}
        </Button>
      </div>
    </form>
  );
}
