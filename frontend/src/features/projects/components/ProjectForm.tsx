import type { Project } from "@blog/shared";
import { projectFormSchema, type ProjectFormValues } from "@/features/projects/schemas/projectForm.schema";
import type { ProjectFormValues as ApiProjectFormValues } from "@blog/shared";
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
import { normalizeProjectStatus, toFormProjectStatus } from "@/lib/projectStatus";
import { slugify, splitCommaList } from "@/lib/slugify";
import { dateInputToIso, normalizeIsoDateTime, toDateInputValue } from "@/lib/format";
import { projectKeys } from "@/features/projects/hooks/useProjects";
import { ProjectPreviewModal } from "@/features/projects/components/ProjectPreviewModal";
import { submitProjectForm } from "@/service/projectForm.service";
import type { ProjectStatus } from "@blog/shared";

type ProjectFormProps = {
  project?: Project;
};

type LocalImage = {
  id: string;
  url: string;
  file?: File;
  isExisting?: boolean;
};

export function ProjectForm({ project }: ProjectFormProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const markdownInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<LocalImage[]>([]);
  const [slugTouched, setSlugTouched] = useState(Boolean(project));
  const [previewOpen, setPreviewOpen] = useState(false);

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
    defaultValues: {
      title: project?.title ?? "",
      slug: project?.slug ?? "",
      description: project?.description ?? "",
      contentMarkdown: project?.contentMarkdown ?? "",
      status: toFormProjectStatus(project?.status ?? "planned"),
      techStack: project?.techStack ?? [],
      repoUrl: project?.repoUrl ?? "",
      featured: project?.featured ?? false,
      images: project?.images ?? [],
      updatedAt: normalizeIsoDateTime(project?.updatedAt),
    },
  });

  const onInvalid = (formErrors: FieldErrors<ProjectFormValues>) => {
    const firstField = Object.values(formErrors).find((error) => error?.message);
    toast.error(firstField?.message ?? "Verifique os campos do formulário.");
  };

  const title = watch("title");
  const description = watch("description");
  const contentMarkdown = watch("contentMarkdown");
  const status = watch("status");
  const techStack = watch("techStack");
  const repoUrl = watch("repoUrl");

  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(title));
    }
  }, [title, slugTouched, setValue]);

  useEffect(() => {
    if (!project) return;

    reset({
      title: project.title,
      slug: project.slug,
      description: project.description,
      contentMarkdown: project.contentMarkdown,
      status: toFormProjectStatus(project.status),
      techStack: project.techStack,
      repoUrl: project.repoUrl ?? "",
      featured: project.featured,
      images: project.images,
      updatedAt: normalizeIsoDateTime(project.updatedAt),
    });

    setImages(
      project.images.map((url) => ({
        id: url,
        url,
        isExisting: true,
      })),
    );
  }, [project, reset]);

  function handleImageSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    const nextImages = selected.map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      url: URL.createObjectURL(file),
      file,
    }));

    setImages((current) => [...current, ...nextImages]);
  }

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

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.file) {
        URL.revokeObjectURL(target.url);
      }
      return current.filter((item) => item.id !== id);
    });
  }

  async function onSubmit(values: ProjectFormValues) {
    const payload: ApiProjectFormValues = {
      ...values,
      status: normalizeProjectStatus(values.status),
      updatedAt: normalizeIsoDateTime(values.updatedAt),
      images: images
        .filter((item) => item.isExisting)
        .map((item) => item.url),
    };

    try {
      const result = await submitProjectForm(
        payload,
        {
          images: images.filter((item) => item.file).map((item) => item.file!),
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
      navigate("/admin/projects", { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar o projeto.",
      );
    }
  }

  return (
    <>
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

      <div className="grid gap-4 md:grid-cols-2">
        <Select label="Status" error={errors.status?.message} {...register("status")}>
          <option value="planned">Planejado</option>
          <option value="wip">Em andamento</option>
          <option value="completed">Concluído</option>
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

      <label className="flex items-center gap-3 text-sm text-text-muted">
        <input
          type="checkbox"
          className="size-4 rounded border-white/20 bg-transparent"
          {...register("featured")}
        />
        Destacar na home
      </label>

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

      <section className="admin-card-muted p-4 sm:p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-text">Imagens do sistema</h2>
          <p className="text-xs text-text-muted mt-1">
            Prints e capturas de tela do projeto (JPEG, PNG, WebP ou GIF).
          </p>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleImageSelection}
        />

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => imageInputRef.current?.click()}
        >
          Adicionar imagens
        </Button>

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt="Prévia do projeto"
                  className="w-full aspect-video object-cover rounded-xl border border-white/10"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-[11px] text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(image.id)}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/admin/projects")}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setPreviewOpen(true)}
        >
          Pré-visualizar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : project ? "Salvar alterações" : "Criar projeto"}
        </Button>
      </div>
      </form>

      <ProjectPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={{
          title,
          description,
          contentMarkdown,
          status: normalizeProjectStatus(status) as ProjectStatus,
          techStack,
          repoUrl: repoUrl?.trim() || undefined,
          images: images.map((image) => image.url),
        }}
      />
    </>
  );
}
