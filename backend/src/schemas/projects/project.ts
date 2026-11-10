import { z } from "zod"
import { PROJECT_SLUG_MAX_LENGTH, projectFormSchema } from "@blog/shared"

// Mesmo schema do formulário do admin
export const ProjectPayloadSchema = projectFormSchema

export const ProjectSlugParamSchema = z.object({
  slug: z.string().trim().min(1, "Slug obrigatório.").max(PROJECT_SLUG_MAX_LENGTH),
})

export type ProjectPayloadDTO = z.infer<typeof ProjectPayloadSchema>
export type ProjectSlugParam = z.infer<typeof ProjectSlugParamSchema>
