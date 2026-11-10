import { ONE_MINUTE_MS } from "../constants/rateLimit"
import { createRateLimiter } from "../utils/rateLimit/createRateLimiter"

/** Protege health checks contra abuso; limite generoso para probes de cloud (Render, etc.). */
export const healthRateLimiter = createRateLimiter({
  windowMs: ONE_MINUTE_MS,
  limit: 60,
  message: "Muitas requisições ao health check.",
})
