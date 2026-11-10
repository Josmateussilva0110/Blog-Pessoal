import type { Request, Response } from "express"
import { CommonErrorCode } from "../types/common/errorCode"
import { sendCommonFailure } from "../utils/http/sendCommonFailure"

export const notFound = (_request: Request, response: Response) => {
  sendCommonFailure(response, CommonErrorCode.ROUTE_NOT_FOUND)
}
