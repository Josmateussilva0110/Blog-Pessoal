import { createHash, timingSafeEqual } from "node:crypto"
import type { NextFunction, Request, Response } from "express"
import { env } from "../config/env"
import { CommonErrorCode } from "../types/common/errorCode"
import { sendCommonFailure } from "../utils/http/sendCommonFailure"
import { authMiddleware } from "./auth"
import { rejectIfMustChangePassword } from "./rejectIfMustChangePassword"

const BEARER_PREFIX = "Bearer "

/** Compara os hashes: tamanho fixo, então timingSafeEqual não vaza o tamanho da chave */
function isAgentKey(candidate: string): boolean {
    if (!env.AGENT_API_KEY) return false

    const expected = createHash("sha256").update(env.AGENT_API_KEY).digest()
    const received = createHash("sha256").update(candidate).digest()
    return timingSafeEqual(expected, received)
}

/**
 * Rotas que o agente de publicação pode usar: aceita a chave do agente
 * (Authorization: Bearer) ou, sem o header, a sessão normal do admin por cookie.
 * Com o header presente e a chave errada, recusa sem cair para o cookie.
 */
export async function agentOrAdminAuth(
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> {
    const authorization = request.get("Authorization")

    if (!authorization) {
        await authMiddleware(request, response, (error?: unknown) => {
            if (error) return next(error)
            void rejectIfMustChangePassword(request, response, next).catch(next)
        })
        return
    }

    if (!authorization.startsWith(BEARER_PREFIX) || !isAgentKey(authorization.slice(BEARER_PREFIX.length).trim())) {
        sendCommonFailure(response, CommonErrorCode.UNAUTHORIZED)
        return
    }

    // O agente publica em nome do admin (ProjectService.create grava o autor)
    request.userId = env.ADMIN_USER_ID
    next()
}
