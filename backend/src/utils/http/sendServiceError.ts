import type { Response } from "express"
import type { ServiceResult } from "../../types/serviceResults/ServiceResult"
import { getHttpStatusFromError } from "./getHttpStatusFromError"

type ServiceError<E extends string> = Extract<
  ServiceResult<unknown, E>,
  { status: false }
>["error"]

type SendServiceErrorOptions = {
  includeCode?: boolean
  fallbackStatus?: number
}

export function sendServiceError<E extends string>(
  response: Response,
  error: ServiceError<E>,
  statusMap: Record<E, number>,
  options: SendServiceErrorOptions = {}
): Response {
  const { includeCode = false, fallbackStatus = 400 } = options
  const httpStatus = getHttpStatusFromError(error.code, statusMap, fallbackStatus)

  return response.status(httpStatus).json({
    success: false,
    ...(includeCode ? { code: error.code } : {}),
    message: error.message ?? "Erro inesperado.",
  })
}
