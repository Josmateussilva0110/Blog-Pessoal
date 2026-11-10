import { ProjectUpdateErrorCode } from "../types/projectUpdates/errorCode"

export const projectUpdateErrorHttpStatusMap: Record<ProjectUpdateErrorCode, number> = {
  [ProjectUpdateErrorCode.PROJECT_NOT_FOUND]: 404,
  [ProjectUpdateErrorCode.PROJECT_UPDATE_NOT_FOUND]: 404,
  [ProjectUpdateErrorCode.PROJECT_UPDATE_FETCH_FAILED]: 500,
  [ProjectUpdateErrorCode.PROJECT_UPDATE_SAVE_FAILED]: 500,
  [ProjectUpdateErrorCode.PROJECT_UPDATE_DELETE_FAILED]: 500,
}

export const projectUpdateErrorMessageMap: Record<ProjectUpdateErrorCode, string> = {
  [ProjectUpdateErrorCode.PROJECT_NOT_FOUND]: "Projeto não encontrado.",
  [ProjectUpdateErrorCode.PROJECT_UPDATE_NOT_FOUND]: "Atualização não encontrada.",
  [ProjectUpdateErrorCode.PROJECT_UPDATE_FETCH_FAILED]: "Erro ao carregar atualizações do projeto.",
  [ProjectUpdateErrorCode.PROJECT_UPDATE_SAVE_FAILED]: "Não foi possível salvar a atualização.",
  [ProjectUpdateErrorCode.PROJECT_UPDATE_DELETE_FAILED]: "Não foi possível excluir a atualização.",
}
