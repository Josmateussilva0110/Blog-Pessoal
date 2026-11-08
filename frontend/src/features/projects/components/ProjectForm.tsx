import type {
  Project,
  ProjectFormValues as ApiProjectFormValues,
  ProjectStatus,
} from "@blog/shared";
import { PROJECT_DESCRIPTION_MAX_LENGTH } from "@blog/shared/constants";
import { projectFormSchema, type ProjectFormValues } from "@/features/projects/schemas/projectForm.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm, Controller, type FieldErrors } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/config/routes";
import { ProjectContentField } from "@/features/projects/components/ProjectContentField";
import { ProjectImagesField } from "@/features/projects/components/ProjectImagesField";
import { TechStackField } from "@/features/projects/components/TechStackField";
import { projectKeys } from "@/features/projects/lib/queryKeys";
import { buildImageSubmission, useProjectImages } from "@/features/projects/hooks/useProjectImages";
import { toProjectFormValues } from "@/features/projects/lib/projectFormValues";
import { dateInputToIso, normalizeIsoDateTime, toDateInputValue } from "@/lib/format";
import { PLATFORM_LABELS } from "@/lib/projectPlatform";
import { getStatusLabel, normalizeProjectStatus } from "@/lib/projectStatus";
import { slugify } from "@/lib/slugify";
import { unwrap } from "@/service";
import { submitProjectForm } from "@/service/projectForm.service";

type ProjectFormProps = {
  project?: Project;
};

const STATUS_OPTIONS: ProjectStatus[] = ["planned", "wip", "completed"];

export function ProjectForm({ project }: ProjectFormProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
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
      unwrap(await submitProjectForm(payload, { images: imageSubmission.files }, project?.id));

      // Inclui o projeto em edição (projectKeys.adminDetail)
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });

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
        maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
        error={errors.description?.message}
        {...register("description")}
      />

      <Controller
        name="contentMarkdown"
        control={control}
        render={({ field }) => (
          <ProjectContentField
            value={field.value}
            onChange={(content) => field.onChange(content)}
            error={errors.contentMarkdown?.message}
          />
        )}
      />

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
        <label className="flex min-h-11 items-center gap-3 text-sm text-home-body">
          <input
            type="checkbox"
            className="size-4 rounded accent-brand"
            {...register("featured")}
          />
          Destacar na home
        </label>
        <p className="text-xs text-home-muted">
          Exibe somente os projetos marcados nos cards principais da home — pode ser 1, 2 ou mais,
          sem preencher com outros projetos.
        </p>
      </div>

      <Controller
        name="techStack"
        control={control}
        render={({ field }) => (
          <TechStackField
            value={field.value}
            onChange={field.onChange}
            error={errors.techStack?.message}
          />
        )}
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
