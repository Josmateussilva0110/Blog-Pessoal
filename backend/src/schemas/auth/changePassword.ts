import { z } from "zod"
import { confirmPasswordField, loginPasswordField, passwordField } from "../fields/password"

/**
 * Cobre a troca normal e a obrigatória (primeiro acesso). A senha atual é opcional
 * aqui porque só o service sabe se o usuário está na troca obrigatória; quando não
 * está, ele exige a senha atual.
 */
export const ChangePasswordSchema = z
  .object({
    current_password: loginPasswordField.optional(),
    new_password: passwordField,
    confirm_password: confirmPasswordField,
  })
  .strict()
  .refine((data) => data.new_password === data.confirm_password, {
    error: "As senhas não coincidem.",
    path: ["confirm_password"],
  })
  .refine((data) => data.current_password !== data.new_password, {
    error: "A nova senha deve ser diferente da atual.",
    path: ["new_password"],
  })

export type ChangePasswordDTO = z.infer<typeof ChangePasswordSchema>
