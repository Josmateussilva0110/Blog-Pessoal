import type { ForcedChangePasswordDTO } from "./forcedChangePasswordSchema"
import type { UpdatePasswordDTO } from "./updatePasswordSchema"

export type ChangePasswordDTO = ForcedChangePasswordDTO | UpdatePasswordDTO
