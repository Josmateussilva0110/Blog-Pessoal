import type { PaginationQuery } from "../schemas/common/pagination"
import type { PaginatedList } from "../types/common/pagination"

/** Intervalo inclusivo [from, to] que o PostgREST espera em .range() */
export function toRowRange({ page, limit }: PaginationQuery): [number, number] {
  const from = (page - 1) * limit
  return [from, from + limit - 1]
}

export function toPaginatedList<T>(
  items: T[],
  total: number | null,
  { page, limit }: PaginationQuery,
): PaginatedList<T> {
  return { items, pagination: { page, limit, total: total ?? items.length } }
}
