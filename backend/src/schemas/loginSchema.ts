import { z } from "zod"
import { loginPasswordField } from "./passwordSchema"

export const LoginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Email inválido."),
    password: loginPasswordField,
  })
  .strict()
