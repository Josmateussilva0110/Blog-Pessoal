import type { NextFunction, Request, Response } from "express"
import type { ZodType } from "zod"
import type { ValidateTarget, ValidatedData } from "../types/common/validation"
import { sendValidationError } from "../utils/http/sendValidationError"

type ValidateSchemas = Partial<Record<ValidateTarget, ZodType>>

const TARGETS: ValidateTarget[] = ["params", "query", "body"]

/**
 * Valida corpo, query e params antes do controller. O resultado convertido vai para
 * request.validated, porque no Express 5 request.query não aceita atribuição.
 */
export const validate =
  (schemas: ValidateSchemas) =>
  (request: Request, response: Response, next: NextFunction) => {
    // Mantém o que um validate anterior da mesma rota já gravou (params antes do upload, body depois)
    const validated: ValidatedData = { ...request.validated }

    for (const target of TARGETS) {
      const schema = schemas[target]
      if (!schema) continue

      const result = schema.safeParse(request[target])
      if (!result.success) {
        sendValidationError(response, result.error, target)
        return
      }

      validated[target] = { schema, data: result.data }
    }

    request.validated = validated
    next()
  }
