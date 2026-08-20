import jwt from "jsonwebtoken"
import { supabaseAdmin } from "../../database/supabase/supabase"
import { env } from "../../config/env"

/** Tempo de vida do JWT emitido pelo backend para queries PostgREST (RLS). */
const SUPABASE_DB_JWT_TTL_SECONDS = 300

export function getUserIdFromAccessToken(accessToken: string): string | undefined {
  try {
    const payload = jwt.verify(accessToken, env.SUPABASE_JWT_SECRET, {
      algorithms: ["HS256"],
    }) as { sub?: string }

    return payload.sub
  } catch {
    return undefined
  }
}

/**
 * Resolve o user id com JWT verificado localmente ou validação via Supabase Auth.
 * Nunca confia em jwt.decode — tokens forjados são rejeitados.
 */
export async function resolveUserIdFromAccessToken(
  accessToken: string,
): Promise<string | undefined> {
  const verifiedUserId = getUserIdFromAccessToken(accessToken)
  if (verifiedUserId) {
    return verifiedUserId
  }

  const { data, error } = await supabaseAdmin.auth.getUser(accessToken)

  if (error || !data.user) {
    return undefined
  }

  return data.user.id
}

/**
 * Emite JWT curto para o PostgREST respeitar RLS (auth.uid()).
 * Sem `iat`: PostgREST só valida iat quando presente; omitir evita PGRST303
 * quando o relógio do servidor (ex.: Belmo) está adiantado em relação ao PostgREST.
 */
export function mintSupabaseAccessToken(userId: string): string {
  const issuer = `${env.SUPABASE_URL.replace(/\/+$/, "")}/auth/v1`

  return jwt.sign(
    {
      sub: userId,
      aud: "authenticated",
      role: "authenticated",
      iss: issuer,
    },
    env.SUPABASE_JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: SUPABASE_DB_JWT_TTL_SECONDS,
      noTimestamp: true,
    },
  )
}
