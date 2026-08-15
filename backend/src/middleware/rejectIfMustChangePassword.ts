import { NextFunction, Request, Response } from "express"
import UserService from "../services/UserService"

export async function rejectIfMustChangePassword(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  const accessToken = request.accessToken

  if (!accessToken) {
    response.status(401).json({ success: false, message: "Sessão não encontrada." })
    return
  }

  const profileResult = await UserService.getProfile(accessToken)

  if (!profileResult.status) {
    response.status(401).json({
      success: false,
      message: profileResult.error.message,
    })
    return
  }

  if (profileResult.data.must_change_password) {
    response.status(403).json({
      success: false,
      code: "PASSWORD_CHANGE_REQUIRED",
      message: "Defina uma nova senha antes de continuar.",
    })
    return
  }

  next()
}
