import type { Project } from "@blog/shared";
import { projectFormSchema, type ProjectFormValues } from "@/features/projects/schemas/projectForm.schema";
import type { ProjectFormValues as ApiProjectFormValues } from "@blog/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/toast";
import { normalizeProjectStatus } from "@/lib/projectStatus";
import { slugify, splitCommaList } from "@/lib/slugify";
import { projectKeys } from "@/features/projects/hooks/useProjects";
import { submitProjectForm } from "@/service/projectForm.service";

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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: project?.title ?? "",
      slug: project?.slug ?? "",
      contentMarkdown: project?.contentMarkdown ?? project?.description ?? "",
      status: normalizeProjectStatus(project?.status ?? "wip"),
      techStack: project?.techStack ?? [],
      repoUrl: project?.repoUrl ?? "",
      featured: project?.featured ?? false,
      images: project?.images ?? [],
    },
  });

  const title = watch("title");

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
      contentMarkdown: project.contentMarkdown || project.description,
      status: normalizeProjectStatus(project.status),
      techStack: project.techStack,
      repoUrl: project.repoUrl ?? "",
      featured: project.featured,
      images: project.images,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
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

        <Textarea
          placeholder="Descreva o contexto, desafios, solução e resultados..."
          className="min-h-48"
          error={errors.contentMarkdown?.message}
          {...register("contentMarkdown")}
        />
        <p className="text-xs text-text-muted">
          Você pode escrever direto aqui ou importar um arquivo `.md` para preencher a descrição.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select label="Status" error={errors.status?.message} {...register("status")}>
          <option value="wip">Em andamento</option>
          <option value="active">Ativo</option>
          <option value="completed">Concluído</option>
        </Select>

        <label className="flex items-center gap-3 text-sm text-text-muted mt-7">
          <input
            type="checkbox"
            className="size-4 rounded border-white/20 bg-transparent"
            {...register("featured")}
          />
          Destacar na home
        </label>
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

      <section className="glass rounded-2xl p-4 sm:p-5 space-y-4">
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : project ? "Salvar alterações" : "Criar projeto"}
        </Button>
      </div>
    </form>
  );
}
