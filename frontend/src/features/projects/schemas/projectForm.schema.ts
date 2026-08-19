import { z } from "zod";

const projectStatusSchema = z.enum(["active", "completed", "wip"]);

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
  status: projectStatusSchema,
  techStack: z.array(z.string()),
  repoUrl: optionalUrl.optional(),
  featured: z.boolean(),
  images: z.array(z.string().url()),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
