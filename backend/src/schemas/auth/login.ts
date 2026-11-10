import { loginSchema } from "@blog/shared"
import type { z } from "zod"

// Mesmo schema do formulário de login; strict recusa campos extras na API
export const LoginSchema = loginSchema.strict()

export type LoginDTO = z.infer<typeof LoginSchema>
