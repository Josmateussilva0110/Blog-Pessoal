import type { Response } from "express"
import type { HttpResponse } from "../../types/common/httpResponse"

/** Única forma de responder sucesso: nenhum controller monta o envelope à mão */
export function sendSuccess<T>(
  response: Response,
  message: string,
  data?: T,
  status = 200,
): Response<HttpResponse<T>> {
  const body: HttpResponse<T> = {
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  }

  return response.status(status).json(body)
}
