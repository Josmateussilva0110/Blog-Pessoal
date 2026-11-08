import { z } from "zod";
import {
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_SLUG_MAX_LENGTH,
  PROJECT_TITLE_MAX_LENGTH,
} from "../constants/project.constants";
import { projectUpdateSchema } from "./projectUpdate.schema";

export const projectStatusSchema = z.enum(["planned", "completed", "wip"]);

export const projectPlatformSchema = z.enum(["mobile", "web"]);

export const markdownFileSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().min(1),
  path: z.string().min(1),
  url: z.url(),
  sortOrder: z.number().int().min(0),
});

export const projectSchema = z.object({
  id: z.uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  contentMarkdown: z.string().min(1),
  status: projectStatusSchema,
  platform: projectPlatformSchema.default("web"),
  techStack: z.array(z.string()),
  repoUrl: z.url().optional(),
  coverImage: z.url().optional(),
  images: z.array(z.url()).default([]),
  markdownFiles: z.array(markdownFileSchema).default([]),
  featured: z.boolean().default(false),
  /** Só vem preenchido no detalhe do projeto (listas não carregam atualizações) */
  updates: z.array(projectUpdateSchema).default([]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type ProjectPlatform = z.infer<typeof projectPlatformSchema>;
export type MarkdownFile = z.infer<typeof markdownFileSchema>;
export type Project = z.infer<typeof projectSchema>;

/** Como a home escolheu os projetos em destaque: marcados como destaque ou os mais recentes */
export type HomeSpotlightMode = "featured" | "recent";

/** Projetos da home já separados pelo backend (ambas as listas por updatedAt, mais recente primeiro) */
export type HomeProjects = {
  spotlight: Project[];
  others: Project[];
  spotlightMode: HomeSpotlightMode;
};

/**
 * URL http(s): z.url() sozinho aceita javascript:, data: etc., que viram
 * XSS ou rastreamento quando renderizados em href/src.
 */
const httpUrl = z
  .url("URL inválida.")
  .refine((value) => /^https?:\/\//i.test(value), "Use um endereço http(s).");

export const imageOrderEntrySchema = z.union([
  httpUrl,
  z.object({ pending: z.number().int().nonnegative() }),
]);

export type ImageOrderEntry = z.infer<typeof imageOrderEntrySchema>;

const optionalUrl = httpUrl
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value));

export const projectFormSchema = z.object({
  title: z.string().trim().min(1, "Título obrigatório.").max(PROJECT_TITLE_MAX_LENGTH),
  slug: z
    .string()
    .trim()
    .min(1, "Slug obrigatório.")
    .max(PROJECT_SLUG_MAX_LENGTH)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens."),
  contentMarkdown: z.string().trim().min(1, "Descreva o projeto."),
  description: z
    .string()
    .trim()
    .min(1, "Resumo obrigatório.")
    .max(
      PROJECT_DESCRIPTION_MAX_LENGTH,
      `O resumo deve ter no máximo ${PROJECT_DESCRIPTION_MAX_LENGTH} caracteres.`,
    ),
  status: projectStatusSchema,
  platform: projectPlatformSchema,
  techStack: z.array(z.string()),
  repoUrl: optionalUrl.optional(),
  featured: z.boolean(),
  images: z.array(httpUrl),
  imageOrder: z.array(imageOrderEntrySchema).optional(),
  updatedAt: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      error: "Data de atualização inválida.",
    }),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const createProjectSchema = projectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  updates: true,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
