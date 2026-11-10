import rateLimit, { type Options } from "express-rate-limit"
import { CommonErrorCode } from "../../types/common/errorCode"
import { sendCommonFailure } from "../http/sendCommonFailure"
import { getRateLimitStore } from "./rateLimitStore"

type RateLimiterOptions = Pick<Options, "windowMs" | "limit"> &
  Partial<Pick<Options, "skipSuccessfulRequests">> & {
    message?: string
  }

/** Rate limiter que responde no envelope da API, com code TOO_MANY_REQUESTS */
export function createRateLimiter({ message, ...options }: RateLimiterOptions) {
  const store = getRateLimitStore()

  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...(store ? { store } : {}),
    ...options,
    handler: (_request, response) => {
      sendCommonFailure(response, CommonErrorCode.TOO_MANY_REQUESTS, message)
    },
  })
}
