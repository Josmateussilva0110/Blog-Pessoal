import type { ServiceResult } from "../common/serviceResult"
import type { ProjectErrorCode } from "./errorCode"

export type ProjectResult<T> = ServiceResult<T, ProjectErrorCode>

export type { UploadableFile } from "./upload"
