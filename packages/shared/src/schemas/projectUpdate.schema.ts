import { z } from "zod";

/** Atualização publicada de um projeto (changelog exibido na página de detalhes) */
export const projectUpdateSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string().min(1),
  version: z.string().optional(),
  contentMarkdown: z.string(),
  publishedAt: z.string().datetime({ offset: true }),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;

export const projectUpdateFormSchema = z.object({
  title: z.string().trim().min(1, "Título obrigatório.").max(120),
  version: z
    .string()
    .trim()
    .max(30, "A versão deve ter no máximo 30 caracteres.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  contentMarkdown: z
    .string()
    .trim()
    .max(20000, "O texto deve ter no máximo 20000 caracteres."),
  publishedAt: z
    .string()
    .min(1, "Data obrigatória.")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Data inválida.",
    }),
});

export type ProjectUpdateFormInput = z.input<typeof projectUpdateFormSchema>;
export type ProjectUpdateFormValues = z.infer<typeof projectUpdateFormSchema>;
