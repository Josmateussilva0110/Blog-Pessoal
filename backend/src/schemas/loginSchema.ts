import { loginSchema } from "@blog/shared"

// Mesmo schema do formulário de login; strict recusa campos extras na API
export const LoginSchema = loginSchema.strict()
