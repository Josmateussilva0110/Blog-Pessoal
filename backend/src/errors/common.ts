import { CommonErrorCode } from "../types/common/errorCode"

export const commonErrorHttpStatusMap: Record<CommonErrorCode, number> = {
  [CommonErrorCode.VALIDATION_ERROR]: 422,
  [CommonErrorCode.INVALID_JSON]: 400,
  [CommonErrorCode.PAYLOAD_TOO_LARGE]: 413,
  [CommonErrorCode.INVALID_UPLOAD]: 422,
  [CommonErrorCode.ROUTE_NOT_FOUND]: 404,
  [CommonErrorCode.TOO_MANY_REQUESTS]: 429,
  [CommonErrorCode.CSRF_REJECTED]: 403,
  [CommonErrorCode.UNAUTHORIZED]: 401,
  [CommonErrorCode.FORBIDDEN]: 403,
  [CommonErrorCode.PASSWORD_CHANGE_REQUIRED]: 403,
  [CommonErrorCode.INTERNAL_ERROR]: 500,
}

export const commonErrorMessageMap: Record<CommonErrorCode, string> = {
  [CommonErrorCode.VALIDATION_ERROR]: "Erro de validação",
  [CommonErrorCode.INVALID_JSON]: "Corpo da requisição inválido.",
  [CommonErrorCode.PAYLOAD_TOO_LARGE]: "Corpo da requisição muito grande.",
  [CommonErrorCode.INVALID_UPLOAD]: "Não foi possível processar o arquivo enviado.",
  [CommonErrorCode.ROUTE_NOT_FOUND]: "Rota não encontrada.",
  [CommonErrorCode.TOO_MANY_REQUESTS]: "Muitas requisições. Tente novamente em 15 minutos.",
  [CommonErrorCode.CSRF_REJECTED]: "Requisição recusada por segurança. Recarregue a página e tente novamente.",
  [CommonErrorCode.UNAUTHORIZED]: "Sessão não encontrada.",
  [CommonErrorCode.FORBIDDEN]: "Acesso restrito ao administrador.",
  [CommonErrorCode.PASSWORD_CHANGE_REQUIRED]: "Defina uma nova senha antes de continuar.",
  [CommonErrorCode.INTERNAL_ERROR]: "Erro interno do servidor.",
}
