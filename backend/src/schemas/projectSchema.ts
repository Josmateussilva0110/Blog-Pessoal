import { z } from "zod"
import { projectFormSchema } from "@blog/shared"

export const projectIdParamSchema = z.object({
  id: z.string().uuid("ID inválido."),
})

export const projectSlugParamSchema = z.object({
  slug: z.string().min(1),
})

export const projectPayloadSchema = projectFormSchema

export type ProjectPayload = z.infer<typeof projectPayloadSchema>
export type ProjectIdParams = z.infer<typeof projectIdParamSchema>
export type ProjectSlugParams = z.infer<typeof projectSlugParamSchema>
