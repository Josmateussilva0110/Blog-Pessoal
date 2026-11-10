import { FIFTEEN_MINUTES_MS, TOO_MANY_ATTEMPTS_MESSAGE } from "../constants/rateLimit"
import { createRateLimiter } from "../utils/rateLimit/createRateLimiter"

export const changePasswordRateLimiter = createRateLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: 5,
  skipSuccessfulRequests: true,
  message: TOO_MANY_ATTEMPTS_MESSAGE,
})
