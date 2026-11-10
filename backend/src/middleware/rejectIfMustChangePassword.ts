import type { NextFunction, Request, Response } from "express"
import { userErrorHttpStatusMap } from "../errors/users"
import UserService from "../services/UserService"
import { CommonErrorCode } from "../types/common/errorCode"
import { requireAuthField } from "../utils/auth/requireAuthField"
import { sendCommonFailure } from "../utils/http/sendCommonFailure"
import { sendFailure } from "../utils/http/sendFailure"

/** Enquanto a troca de senha obrigatória não for feita, o admin só pode trocar a senha */
export async function rejectIfMustChangePassword(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  const result = await UserService.getProfile(requireAuthField(request, "userId"))

  if (!result.status) {
    sendFailure(response, result.error, userErrorHttpStatusMap)
    return
  }

  if (result.data.must_change_password) {
    sendCommonFailure(response, CommonErrorCode.PASSWORD_CHANGE_REQUIRED)
    return
  }

  next()
}
