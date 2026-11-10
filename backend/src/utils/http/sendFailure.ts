import type { Response } from "express"
import { errorMessageMap, type ErrorCode } from "../../errors"
import type { FieldError, HttpResponse } from "../../types/common/httpResponse"
import type { ServiceError } from "../../types/common/serviceResult"

/**
 * Única forma de responder erro: sempre leva o code, e cai na mensagem padrão do
 * código quando o service não mandou uma. O genérico amarra o código ao mapa do
 * mesmo domínio — passar o mapa de outro domínio não compila.
 */
export function sendFailure<E extends ErrorCode>(
  response: Response,
  error: ServiceError<E>,
  statusMap: Record<NoInfer<E>, number>,
  errors?: FieldError[],
): Response<HttpResponse> {
  const body: HttpResponse = {
    success: false,
    message: error.message ?? errorMessageMap[error.code],
    code: error.code,
    ...(errors ? { errors } : {}),
  }

  return response.status(statusMap[error.code]).json(body)
}
