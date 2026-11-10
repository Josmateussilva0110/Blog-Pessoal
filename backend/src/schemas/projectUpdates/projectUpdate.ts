import { z } from "zod"
import { projectUpdateFormSchema } from "@blog/shared"
import { IdParamSchema } from "../common/idParam"
import { uuidField } from "../fields/uuid"

export const ProjectUpdatePayloadSchema = projectUpdateFormSchema

export const ProjectUpdateParamSchema = IdParamSchema.extend({
  updateId: uuidField,
})

export type ProjectUpdatePayloadDTO = z.infer<typeof ProjectUpdatePayloadSchema>
export type ProjectUpdateParam = z.infer<typeof ProjectUpdateParamSchema>
