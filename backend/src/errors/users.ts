import { UserErrorCode } from "../types/users/errorCode"

export const userErrorHttpStatusMap: Record<UserErrorCode, number> = {
  [UserErrorCode.USER_NOT_FOUND]: 404,
  [UserErrorCode.INVALID_PASSWORD]: 422,
  [UserErrorCode.LOGIN_FAILED]: 500,
  [UserErrorCode.USER_FETCH_FAILED]: 500,
  [UserErrorCode.USER_UPDATE_FAILED]: 500,
  [UserErrorCode.INVALID_CREDENTIALS]: 401,
  [UserErrorCode.SESSION_EXPIRED]: 401,
  [UserErrorCode.SESSION_REVOKED]: 401,
  [UserErrorCode.LOGOUT_FAILED]: 500,
  [UserErrorCode.PASSWORD_RESET_REQUEST_FAILED]: 500,
  [UserErrorCode.PROFILE_IMAGE_INVALID]: 422,
  [UserErrorCode.PROFILE_IMAGE_NOT_FOUND]: 404,
}

export const userErrorMessageMap: Record<UserErrorCode, string> = {
  [UserErrorCode.USER_NOT_FOUND]: "Usuário não encontrado.",
  [UserErrorCode.INVALID_PASSWORD]: "Informe a senha atual.",
  [UserErrorCode.LOGIN_FAILED]: "Erro ao fazer login.",
  [UserErrorCode.USER_FETCH_FAILED]: "Erro ao buscar perfil do usuário.",
  [UserErrorCode.USER_UPDATE_FAILED]: "Não foi possível atualizar o perfil.",
  [UserErrorCode.INVALID_CREDENTIALS]: "Email ou senha incorreto.",
  [UserErrorCode.SESSION_EXPIRED]: "Sessão expirada. Faça login novamente.",
  [UserErrorCode.SESSION_REVOKED]: "Sessão encerrada por segurança. Faça login novamente.",
  [UserErrorCode.LOGOUT_FAILED]: "Erro ao fazer logout.",
  [UserErrorCode.PASSWORD_RESET_REQUEST_FAILED]: "Não foi possível registrar a solicitação.",
  [UserErrorCode.PROFILE_IMAGE_INVALID]: "Arquivo de imagem inválido.",
  [UserErrorCode.PROFILE_IMAGE_NOT_FOUND]: "Foto de perfil não encontrada.",
}
