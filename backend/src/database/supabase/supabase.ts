import { createClient } from "@supabase/supabase-js"
import { env } from "../../config/env"
import { mintSupabaseAccessToken } from "../../utils/auth/accessToken"

const clientOptions = {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
} as const

/**
 * Ignora RLS. Só para o que nenhuma policy cobre: escrita do admin (as policies de
 * escrita foram removidas), leitura pública sem sessão e APIs administrativas de auth.
 */
export const supabaseAdmin = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    clientOptions
)

/** Auth flows (login/refresh) — não compartilha sessão com o supabaseAdmin. */
export const supabaseAuth = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    clientOptions
)

/** Cliente isolado por requisição — reauth e updateUser de senha. */
export function createEphemeralAuthClient() {
    return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, clientOptions)
}

/**
 * Respeita RLS: emite JWT próprio do usuário para o PostgREST. O userId deve vir
 * do authMiddleware (token já verificado), nunca do corpo ou da URL.
 */
export function createSupabaseClientForUser(userId: string) {
    const dbAccessToken = mintSupabaseAccessToken(userId)

    return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
        ...clientOptions,
        global: {
            headers: {
                Authorization: `Bearer ${dbAccessToken}`,
            },
        },
    })
}
