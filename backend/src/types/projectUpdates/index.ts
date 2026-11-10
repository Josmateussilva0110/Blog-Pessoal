import type { ServiceResult } from "../common/serviceResult"
import type { ProjectUpdateErrorCode } from "./errorCode"

export type ProjectUpdateResult<T> = ServiceResult<T, ProjectUpdateErrorCode>
