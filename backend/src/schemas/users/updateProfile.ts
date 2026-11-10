import { z } from "zod"
import { usernameField } from "../fields/username"

export const UpdateProfileSchema = z
  .object({
    username: usernameField,
  })
  .strict()

export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>
