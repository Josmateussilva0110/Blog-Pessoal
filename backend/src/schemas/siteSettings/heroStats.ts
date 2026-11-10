import { updateHeroStatsSchema } from "@blog/shared"
import type { z } from "zod"

export const UpdateHeroStatsSchema = updateHeroStatsSchema

export type UpdateHeroStatsDTO = z.infer<typeof UpdateHeroStatsSchema>
