import type { Response } from "express"
import { commonErrorHttpStatusMap } from "../../errors/common"
import type { CommonErrorCode } from "../../types/common/errorCode"
import { sendFailure } from "./sendFailure"

/** Atalho para os middlewares, que só respondem erros comuns */
export function sendCommonFailure(response: Response, code: CommonErrorCode, message?: string) {
  return sendFailure(response, { code, message }, commonErrorHttpStatusMap)
}
