import { z } from "zod"
import { emailField } from "../fields/email"

export const PasswordResetRequestSchema = z
  .object({
    identifier: emailField,
  })
  .strict()

export type PasswordResetRequestDTO = z.infer<typeof PasswordResetRequestSchema>
