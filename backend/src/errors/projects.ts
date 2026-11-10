import { ProjectErrorCode } from "../types/projects/errorCode"

export const projectErrorHttpStatusMap: Record<ProjectErrorCode, number> = {
  [ProjectErrorCode.PROJECT_NOT_FOUND]: 404,
  [ProjectErrorCode.PROJECT_SLUG_EXISTS]: 409,
  [ProjectErrorCode.PROJECT_CREATE_FAILED]: 500,
  [ProjectErrorCode.PROJECT_UPDATE_FAILED]: 500,
  [ProjectErrorCode.PROJECT_DELETE_FAILED]: 500,
  [ProjectErrorCode.PROJECT_FETCH_FAILED]: 500,
  [ProjectErrorCode.PROJECT_ASSET_INVALID]: 422,
}

export const projectErrorMessageMap: Record<ProjectErrorCode, string> = {
  [ProjectErrorCode.PROJECT_NOT_FOUND]: "Projeto não encontrado.",
  [ProjectErrorCode.PROJECT_SLUG_EXISTS]: "Já existe um projeto com este slug.",
  [ProjectErrorCode.PROJECT_CREATE_FAILED]: "Não foi possível criar o projeto.",
  [ProjectErrorCode.PROJECT_UPDATE_FAILED]: "Não foi possível atualizar o projeto.",
  [ProjectErrorCode.PROJECT_DELETE_FAILED]: "Não foi possível excluir o projeto.",
  [ProjectErrorCode.PROJECT_FETCH_FAILED]: "Erro ao carregar projetos.",
  [ProjectErrorCode.PROJECT_ASSET_INVALID]: "Envie apenas imagens JPEG, PNG, WebP ou GIF.",
}

/** Imagem referenciada por URL que o projeto não tem: novas imagens só entram como arquivo */
export const UNKNOWN_IMAGE_URL_MESSAGE = "Imagem inválida: envie novas imagens como arquivo."

export const IMAGE_UPLOAD_FAILED_MESSAGE = "Erro ao enviar imagens do projeto."
