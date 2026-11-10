import type { ServiceResult } from "../common/serviceResult"
import type { SiteSettingsErrorCode } from "./errorCode"

export type SiteSettingsResult<T> = ServiceResult<T, SiteSettingsErrorCode>
