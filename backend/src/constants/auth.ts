/** Tempo de vida do JWT emitido pelo backend para queries PostgREST (RLS). */
export const SUPABASE_DB_JWT_TTL_SECONDS = 300

/** Por quanto tempo um logout invalida os access tokens ainda válidos do usuário */
export const USER_SESSION_REVOKE_TTL_MS = 60 * 60 * 1000

export const REVOKED_TOKEN_KEY_PREFIX = "revoked:token:"
export const REVOKED_USER_KEY_PREFIX = "revoked:user:"
