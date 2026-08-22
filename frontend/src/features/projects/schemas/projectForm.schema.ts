import { z } from "zod";

const projectStatusSchema = z.enum(["planned", "wip", "completed"]);

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
  description: z
    .string()
    .trim()
    .min(1, "Resumo obrigatório.")
    .max(500, "O resumo deve ter no máximo 500 caracteres."),
  contentMarkdown: z.string().trim().min(1, "Descreva o projeto."),
  status: projectStatusSchema,
  techStack: z.array(z.string()),
  repoUrl: optionalUrl.optional(),
  featured: z.boolean(),
  images: z.array(z.string().url()),
  updatedAt: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: "Data de atualização inválida.",
    }),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
