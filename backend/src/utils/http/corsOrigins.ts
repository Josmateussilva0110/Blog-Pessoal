import { env } from "../../config/env"

const PRIVATE_NETWORK_HOST =
  /^(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})$/

function isPrivateNetworkOrigin(origin: string): boolean {
  try {
    const { protocol, hostname } = new URL(origin)
    return (
      (protocol === "http:" || protocol === "https:") &&
      PRIVATE_NETWORK_HOST.test(hostname)
    )
  } catch {
    return false
  }
}

export function isAllowedCorsOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return true
  }

  if (env.ALLOWED_ORIGINS.includes(origin)) {
    return true
  }

  if (env.NODE_ENV !== "production" && isPrivateNetworkOrigin(origin)) {
    return true
  }

  return false
}
