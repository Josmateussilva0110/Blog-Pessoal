import { ProjectErrorCode } from "../types/code/projectCode"

export const projectErrorHttpStatusMap: Record<ProjectErrorCode, number> = {
  [ProjectErrorCode.PROJECT_NOT_FOUND]: 404,
  [ProjectErrorCode.PROJECT_SLUG_EXISTS]: 409,
  [ProjectErrorCode.PROJECT_CREATE_FAILED]: 500,
  [ProjectErrorCode.PROJECT_UPDATE_FAILED]: 500,
  [ProjectErrorCode.PROJECT_DELETE_FAILED]: 500,
  [ProjectErrorCode.PROJECT_FETCH_FAILED]: 500,
  [ProjectErrorCode.PROJECT_ASSET_INVALID]: 422,
}
