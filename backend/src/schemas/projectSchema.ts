import { z } from "zod"
import { projectFormSchema, projectUpdateFormSchema } from "@blog/shared"

export const projectIdParamSchema = z.object({
  id: z.string().uuid("ID inválido."),
})

export const projectSlugParamSchema = z.object({
  slug: z.string().min(1),
})

export const projectUpdateParamSchema = projectIdParamSchema.extend({
  updateId: z.string().uuid("ID inválido."),
})

export const projectPayloadSchema = projectFormSchema

export const projectUpdatePayloadSchema = projectUpdateFormSchema

export type ProjectPayload = z.infer<typeof projectPayloadSchema>
export type ProjectIdParams = z.infer<typeof projectIdParamSchema>
export type ProjectSlugParams = z.infer<typeof projectSlugParamSchema>
export type ProjectUpdateParams = z.infer<typeof projectUpdateParamSchema>
