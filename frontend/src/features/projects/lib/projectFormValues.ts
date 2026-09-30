import type { Project } from "@blog/shared";
import type { ProjectFormValues } from "@/features/projects/schemas/projectForm.schema";
import { normalizeIsoDateTime } from "@/lib/format";
import { normalizeProjectPlatform } from "@/lib/projectPlatform";
import { toFormProjectStatus } from "@/lib/projectStatus";

/** Valores do formulário a partir de um projeto (edição) ou vazios (criação) */
export function toProjectFormValues(project?: Project): ProjectFormValues {
  return {
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    description: project?.description ?? "",
    contentMarkdown: project?.contentMarkdown ?? "",
    status: toFormProjectStatus(project?.status ?? "planned"),
    platform: normalizeProjectPlatform(project?.platform),
    techStack: project?.techStack ?? [],
    repoUrl: project?.repoUrl ?? "",
    featured: project?.featured ?? false,
    images: project?.images ?? [],
    updatedAt: normalizeIsoDateTime(project?.updatedAt),
  };
}
