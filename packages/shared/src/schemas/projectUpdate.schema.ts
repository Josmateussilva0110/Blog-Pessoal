import { z } from "zod";
import {
  PROJECT_UPDATE_CONTENT_MAX_LENGTH,
  PROJECT_UPDATE_MAX_YEAR,
  PROJECT_UPDATE_MIN_YEAR,
  PROJECT_UPDATE_TITLE_MAX_LENGTH,
  PROJECT_UPDATE_VERSION_MAX_LENGTH,
} from "../constants/project.constants";

/** Atualização publicada de um projeto (changelog exibido na página de detalhes) */
export const projectUpdateSchema = z.object({
  id: z.uuid(),
  projectId: z.uuid(),
  title: z.string().min(1),
  version: z.string().optional(),
  contentMarkdown: z.string(),
  publishedAt: z.iso.datetime({ offset: true }),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;

export const projectUpdateFormSchema = z.object({
  title: z.string().trim().min(1, "Título obrigatório.").max(PROJECT_UPDATE_TITLE_MAX_LENGTH),
  version: z
    .string()
    .trim()
    .max(
      PROJECT_UPDATE_VERSION_MAX_LENGTH,
      `A versão deve ter no máximo ${PROJECT_UPDATE_VERSION_MAX_LENGTH} caracteres.`,
    )
    .optional()
    .transform((value) => (value ? value : undefined)),
  contentMarkdown: z
    .string()
    .trim()
    .max(
      PROJECT_UPDATE_CONTENT_MAX_LENGTH,
      `O texto deve ter no máximo ${PROJECT_UPDATE_CONTENT_MAX_LENGTH} caracteres.`,
    ),
  // ISO com fuso (o formulário envia toISOString); evita datas ambíguas ou fora de faixa
  publishedAt: z.iso
    .datetime({
      offset: true,
      // Data inválida para aqui: o refine de faixa de anos só roda sobre datas válidas
      abort: true,
      error: (issue) => (issue.input === "" ? "Data obrigatória." : "Data inválida."),
    })
    .refine((value) => {
      const year = new Date(value).getUTCFullYear();
      return year >= PROJECT_UPDATE_MIN_YEAR && year <= PROJECT_UPDATE_MAX_YEAR;
    }, "Data fora do intervalo permitido."),
});

export type ProjectUpdateFormInput = z.input<typeof projectUpdateFormSchema>;
export type ProjectUpdateFormValues = z.infer<typeof projectUpdateFormSchema>;
