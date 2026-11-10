import { z } from "zod"
import { uuidField } from "../fields/uuid"

export const IdParamSchema = z.object({
  id: uuidField,
})

export type IdParam = z.infer<typeof IdParamSchema>
