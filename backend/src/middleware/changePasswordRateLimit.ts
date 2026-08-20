import { createRateLimiter } from "../utils/rate-limit/createRateLimiter"

export const changePasswordRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Muitas tentativas. Tente novamente em 15 minutos.",
  },
})
