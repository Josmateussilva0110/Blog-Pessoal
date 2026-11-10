import type { ServiceResult } from "../common/serviceResult"
import type { SiteLinkErrorCode } from "./errorCode"

export type SiteLinkResult<T> = ServiceResult<T, SiteLinkErrorCode>
