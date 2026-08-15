import { z } from "zod"
import { passwordField } from "./passwordSchema"

export const ForcedChangePasswordSchema = z
  .object({
    new_password: passwordField,
    confirm_password: z.string().min(1, "Confirme a nova senha."),
  })
  .strict()
  .refine((data) => data.new_password === data.confirm_password, {
    message: "As senhas não coincidem.",
    path: ["confirm_password"],
  })

export type ForcedChangePasswordDTO = z.infer<typeof ForcedChangePasswordSchema>
