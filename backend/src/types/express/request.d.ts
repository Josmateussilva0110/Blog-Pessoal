import type { ValidatedData } from "../common/validation"

declare global {
  namespace Express {
    interface Request {
      // Preenchidos pelo authMiddleware; opcionais porque o tipo vale também para rotas públicas.
      // Leia sempre com requireAuthField, nunca com "!"
      userId?: string
      accessToken?: string
      /**
       * Dados já convertidos pelo middleware validate (no Express 5, request.query é somente leitura).
       * Leia sempre com requireValidated, que devolve o tipo do schema.
       */
      validated?: ValidatedData
    }
  }
}

export {}
