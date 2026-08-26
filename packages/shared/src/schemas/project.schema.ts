import { z } from "zod";

export const projectStatusSchema = z.enum(["planned", "completed", "wip"]);

export const projectPlatformSchema = z.enum(["mobile", "web"]);

export const markdownFileSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  path: z.string().min(1),
  url: z.string().url(),
  sortOrder: z.number().int().min(0),
});

export const projectSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  contentMarkdown: z.string().min(1),
  status: projectStatusSchema,
  platform: projectPlatformSchema.default("web"),
  techStack: z.array(z.string()),
  repoUrl: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  images: z.array(z.string().url()).default([]),
  markdownFiles: z.array(markdownFileSchema).default([]),
  featured: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type ProjectPlatform = z.infer<typeof projectPlatformSchema>;
export type MarkdownFile = z.infer<typeof markdownFileSchema>;
export type Project = z.infer<typeof projectSchema>;

export const imageOrderEntrySchema = z.union([
  z.string().url(),
  z.object({ pending: z.number().int().nonnegative() }),
]);

export type ImageOrderEntry = z.infer<typeof imageOrderEntrySchema>;

const optionalUrl = z
  .string()
  .url("URL inválida.")
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value));

export const projectFormSchema = z.object({
  title: z.string().trim().min(1, "Título obrigatório.").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "Slug obrigatório.")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens."),
  contentMarkdown: z.string().trim().min(1, "Descreva o projeto."),
  description: z
    .string()
    .trim()
    .min(1, "Resumo obrigatório.")
    .max(500, "O resumo deve ter no máximo 500 caracteres."),
  status: projectStatusSchema,
  platform: projectPlatformSchema,
  techStack: z.array(z.string()),
  repoUrl: optionalUrl.optional(),
  featured: z.boolean(),
  images: z.array(z.string().url()),
  imageOrder: z.array(imageOrderEntrySchema).optional(),
  updatedAt: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: "Data de atualização inválida.",
    }),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const createProjectSchema = projectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
