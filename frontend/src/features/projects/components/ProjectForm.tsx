import type { Project, ProjectFormValues as ApiProjectFormValues, ProjectStatus } from "@blog/shared";
import { projectFormSchema, type ProjectFormValues } from "@/features/projects/schemas/projectForm.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller, type FieldErrors } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/config/routes";
import { ProjectImagesField } from "@/features/projects/components/ProjectImagesField";
import { projectKeys } from "@/features/projects/hooks/useProjects";
import { buildImageSubmission, useProjectImages } from "@/features/projects/hooks/useProjectImages";
import { toProjectFormValues } from "@/features/projects/lib/projectFormValues";
import { dateInputToIso, normalizeIsoDateTime, toDateInputValue } from "@/lib/format";
import { PLATFORM_LABELS } from "@/lib/projectPlatform";
import { normalizeProjectStatus } from "@/lib/projectStatus";
import { slugify, splitCommaList } from "@/lib/slugify";
import { getStatusLabel } from "@/lib/utils";
import { submitProjectForm } from "@/service/projectForm.service";

type ProjectFormProps = {
  project?: Project;
};

const STATUS_OPTIONS: ProjectStatus[] = ["planned", "wip", "completed"];

export function ProjectForm({ project }: ProjectFormProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const markdownInputRef = useRef<HTMLInputElement>(null);
  const { images, resetImages, addFiles, removeImage, moveImage } = useProjectImages();
  const [slugTouched, setSlugTouched] = useState(Boolean(project));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: toProjectFormValues(project),
  });

  const onInvalid = (formErrors: FieldErrors<ProjectFormValues>) => {
    const firstField = Object.values(formErrors).find((error) => error?.message);
    toast.error(firstField?.message ?? "Verifique os campos do formulário.");
  };

  const title = watch("title");

  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(title));
    }
  }, [title, slugTouched, setValue]);

  useEffect(() => {
    if (!project) return;

    reset(toProjectFormValues(project));
    resetImages(project.images);
  }, [project, reset, resetImages]);

  async function handleMarkdownSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      const content = await file.text();
      setValue("contentMarkdown", content, {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success("Conteúdo importado do arquivo .md.");
    } catch {
      toast.error("Não foi possível ler o arquivo .md.");
    }
  }

  async function onSubmit(values: ProjectFormValues) {
    const imageSubmission = buildImageSubmission(images);

    const payload: ApiProjectFormValues = {
      ...values,
      status: normalizeProjectStatus(values.status),
      updatedAt: normalizeIsoDateTime(values.updatedAt),
      images: imageSubmission.images,
      imageOrder: imageSubmission.imageOrder,
    };

    try {
      const result = await submitProjectForm(
        payload,
        {
          images: imageSubmission.files,
        },
        project?.id,
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
      if (project?.id) {
        await queryClient.invalidateQueries({ queryKey: ["admin-project", project.id] });
      }

      toast.success(project ? "Projeto atualizado." : "Projeto criado.");
      navigate(ROUTES.adminProjects, { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar o projeto.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Título"
          placeholder="Nome do projeto"
          error={errors.title?.message}
          {...register("title")}
        />

        <Input
          label="Slug"
          placeholder="meu-projeto"
          error={errors.slug?.message}
          {...register("slug", {
            onChange: () => setSlugTouched(true),
          })}
        />
      </div>

      <Textarea
        label="Resumo"
        placeholder="Breve descrição do projeto para exibir nos cards e listagens"
        rows={3}
        maxLength={500}
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-text">Sobre o projeto</span>
          <input
            ref={markdownInputRef}
            type="file"
            accept=".md,text/markdown"
            className="hidden"
            onChange={handleMarkdownSelection}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => markdownInputRef.current?.click()}
          >
            Importar .md
          </Button>
        </div>

        <Controller
          name="contentMarkdown"
          control={control}
          render={({ field }) => (
            <MarkdownEditor
              value={field.value}
              onChange={field.onChange}
              error={errors.contentMarkdown?.message}
            />
          )}
        />
        <p className="text-xs text-text-muted">
          Editor em markdown puro. Use a aba <strong className="font-medium text-text">Preview</strong>{" "}
          para ver o resultado formatado (tabelas, código, diagramas Mermaid). Também é possível{" "}
          <strong className="font-medium text-text">Importar .md</strong>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select label="Status" error={errors.status?.message} {...register("status")}>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
        </Select>

        <Select label="Plataforma" error={errors.platform?.message} {...register("platform")}>
          <option value="web">{PLATFORM_LABELS.web}</option>
          <option value="mobile">{PLATFORM_LABELS.mobile}</option>
        </Select>

        <Controller
          name="updatedAt"
          control={control}
          render={({ field }) => (
            <Input
              label="Última atualização"
              type="date"
              value={toDateInputValue(field.value)}
              error={errors.updatedAt?.message}
              onChange={(event) => field.onChange(dateInputToIso(event.target.value))}
            />
          )}
        />
      </div>

      <div className="space-y-1">
        <label className="flex items-center gap-3 text-sm text-text-muted">
          <input
            type="checkbox"
            className="size-4 rounded border-hairline-hover bg-transparent"
            {...register("featured")}
          />
          Destacar na home
        </label>
        <p className="text-xs text-text-subtle">
          Exibe somente os projetos marcados nos cards principais da home — pode ser 1, 2 ou mais,
          sem preencher com outros projetos.
        </p>
      </div>

      <Input
        label="Stack"
        placeholder="React, Node.js, Supabase"
        defaultValue={project?.techStack.join(", ") ?? ""}
        onChange={(event) => setValue("techStack", splitCommaList(event.target.value))}
      />

      <Input
        label="Repositório"
        placeholder="https://github.com/..."
        error={errors.repoUrl?.message}
        {...register("repoUrl")}
      />

      <ProjectImagesField
        images={images}
        onAdd={addFiles}
        onRemove={removeImage}
        onMove={moveImage}
      />

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(ROUTES.adminProjects)}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : project ? "Salvar alterações" : "Criar projeto"}
        </Button>
      </div>
    </form>
  );
}
