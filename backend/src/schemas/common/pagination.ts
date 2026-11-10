import { z } from "zod"
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from "../../constants/pagination"

// Teto no limit: sem ele, ?limit=100000 vira um jeito barato de derrubar o banco
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "A página deve ser 1 ou maior.").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "O limite deve ser 1 ou maior.")
    .max(PAGINATION_MAX_LIMIT, `O limite deve ser no máximo ${PAGINATION_MAX_LIMIT}.`)
    .default(PAGINATION_DEFAULT_LIMIT),
})

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>
