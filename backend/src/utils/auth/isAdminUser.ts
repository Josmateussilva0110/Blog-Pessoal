import { env } from "../../config/env"

/** Só o admin configurado em ADMIN_USER_ID usa as rotas protegidas */
export function isAdminUser(userId: string): boolean {
  return userId === env.ADMIN_USER_ID
}
