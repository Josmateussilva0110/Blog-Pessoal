import { updateSiteLinksSchema } from "@blog/shared"
import type { z } from "zod"

export const UpdateSiteLinksSchema = updateSiteLinksSchema

export type UpdateSiteLinksDTO = z.infer<typeof UpdateSiteLinksSchema>
