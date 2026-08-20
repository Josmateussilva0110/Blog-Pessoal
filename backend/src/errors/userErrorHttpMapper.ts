import { UserErrorCode } from "../types/code/userCode"

export const userErrorHttpStatusMap: Record<UserErrorCode, number> = {
  [UserErrorCode.USER_NOT_FOUND]: 404,
  [UserErrorCode.INVALID_PASSWORD]: 422,
  [UserErrorCode.LOGIN_FAILED]: 500,
  [UserErrorCode.USER_FETCH_FAILED]: 500,
  [UserErrorCode.USER_UPDATE_FAILED]: 500,
  [UserErrorCode.INVALID_CREDENTIALS]: 401,
  [UserErrorCode.SESSION_REVOKED]: 401,
  [UserErrorCode.LOGOUT_FAILED]: 500,
  [UserErrorCode.PASSWORD_RESET_REQUEST_FAILED]: 500,
  [UserErrorCode.PROFILE_IMAGE_INVALID]: 422,
  [UserErrorCode.PROFILE_IMAGE_NOT_FOUND]: 404,
}
