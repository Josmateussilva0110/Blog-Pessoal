import type { Request } from "express"
import type { z, ZodType } from "zod"
import type { ValidateTarget } from "../../types/common/validation"

/**
 * Lê o dado que o middleware validate converteu, já com o tipo do schema.
 * Se a rota não validou esse alvo, ou validou com outro schema, é bug de montagem:
 * lança e o errorHandler responde 500, em vez de entregar ao service um dado de formato errado.
 */
export function requireValidated<S extends ZodType>(
  request: Pick<Request, "validated" | "method" | "originalUrl">,
  target: ValidateTarget,
  schema: S,
): z.output<S> {
  const entry = request.validated?.[target]

  if (!entry) {
    throw new Error(`${target} sem validate em ${request.method} ${request.originalUrl}`)
  }

  if (entry.schema !== schema) {
    throw new Error(`${target} validado com outro schema em ${request.method} ${request.originalUrl}`)
  }

  return entry.data as z.output<S>
}
