import { ProjectUpdateErrorCode } from "../types/code/projectUpdateCode"

export const projectUpdateErrorHttpStatusMap: Record<ProjectUpdateErrorCode, number> = {
  [ProjectUpdateErrorCode.PROJECT_NOT_FOUND]: 404,
  [ProjectUpdateErrorCode.PROJECT_UPDATE_NOT_FOUND]: 404,
  [ProjectUpdateErrorCode.PROJECT_UPDATE_FETCH_FAILED]: 500,
  [ProjectUpdateErrorCode.PROJECT_UPDATE_SAVE_FAILED]: 500,
  [ProjectUpdateErrorCode.PROJECT_UPDATE_DELETE_FAILED]: 500,
}
