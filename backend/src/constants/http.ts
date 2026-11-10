export const SAFE_HTTP_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

/** Corpo JSON padrão da API */
export const JSON_BODY_LIMIT = "10kb"

/** Atualizações de projeto levam markdown, por isso o limite maior */
export const PROJECT_UPDATE_BODY_LIMIT = "100kb"

/** Tempo curto: edições e exclusões no admin aparecem no site em até ~1,5 min */
export const PUBLIC_MAX_AGE_SECONDS = 60
export const PUBLIC_STALE_WHILE_REVALIDATE_SECONDS = 30

/** A foto de perfil muda raramente e a URL final já leva versão */
export const PROFILE_IMAGE_REDIRECT_MAX_AGE_SECONDS = 300
