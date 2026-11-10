import type { NextFunction, Request, Response } from "express"
import { CommonErrorCode } from "../types/common/errorCode"
import { sendCommonFailure } from "../utils/http/sendCommonFailure"

type BodyParserError = Error & { type?: string }

/**
 * Último middleware: tudo o que foi lançado vira resposta no envelope. Nunca devolve
 * stack nem error.message; o detalhe fica só no log do servidor.
 */
export const errorHandler = (
  error: BodyParserError,
  request: Request,
  response: Response,
  _next: NextFunction,
) => {
  // Corpo grande demais ou JSON malformado são erro do cliente, não do servidor
  if (error.type === "entity.too.large") {
    sendCommonFailure(response, CommonErrorCode.PAYLOAD_TOO_LARGE)
    return
  }

  if (error.type === "entity.parse.failed") {
    sendCommonFailure(response, CommonErrorCode.INVALID_JSON)
    return
  }

  console.error(`[errorHandler] ${request.method} ${request.originalUrl}`, error)
  sendCommonFailure(response, CommonErrorCode.INTERNAL_ERROR)
}
