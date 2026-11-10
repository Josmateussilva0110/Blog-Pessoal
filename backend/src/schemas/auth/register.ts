import { z } from "zod"
import { emailField } from "../fields/email"
import { passwordField } from "../fields/password"
import { usernameField } from "../fields/username"

// Usado pelo script create-user (não há rota pública de cadastro)
export const RegisterSchema = z.object({
  username: usernameField,
  email: emailField,
  password: passwordField,
})

export type RegisterDTO = z.infer<typeof RegisterSchema>
