import jwt from "jsonwebtoken"
import { env } from "../../config/env"
import { SUPABASE_DB_JWT_TTL_SECONDS } from "../../constants/auth"
import { supabaseAdmin } from "../../database/supabase/supabase"
import { isAccessTokenRevoked, isUserSessionRevoked } from "./tokenRevocation"

function verifyUserIdLocally(accessToken: string): string | undefined {
  try {
    const payload = jwt.verify(accessToken, env.SUPABASE_JWT_SECRET, {
      algorithms: ["HS256"],
    }) as { sub?: string }

    return payload.sub || undefined
  } catch {
    return undefined
  }
}

/**
 * Resolve o user id de um access token com JWT verificado localmente ou, se a
 * verificação local falhar, pelo Supabase Auth. Nunca confia em jwt.decode —
 * tokens forjados são rejeitados. Token ou usuário revogado (logout) não passa.
 */
export async function resolveActiveUserId(accessToken: string): Promise<string | undefined> {
  if (await isAccessTokenRevoked(accessToken)) return undefined

  const userId = verifyUserIdLocally(accessToken) ?? (await fetchUserIdFromProvider(accessToken))
  if (!userId) return undefined

  return (await isUserSessionRevoked(userId)) ? undefined : userId
}

async function fetchUserIdFromProvider(accessToken: string): Promise<string | undefined> {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken)
  return error || !data.user ? undefined : data.user.id
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
