import type { ZodType } from "zod"

export type ValidateTarget = "body" | "query" | "params"

/** Guarda o schema junto do dado, para o controller conferir que leu o que a rota validou */
export type ValidatedEntry = {
  schema: ZodType
  data: unknown
}

export type ValidatedData = Partial<Record<ValidateTarget, ValidatedEntry>>
