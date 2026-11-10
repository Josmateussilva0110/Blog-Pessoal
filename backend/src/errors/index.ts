import type { CommonErrorCode } from "../types/common/errorCode"
import type { ProjectErrorCode } from "../types/projects/errorCode"
import type { ProjectUpdateErrorCode } from "../types/projectUpdates/errorCode"
import type { SiteLinkErrorCode } from "../types/siteLinks/errorCode"
import type { SiteSettingsErrorCode } from "../types/siteSettings/errorCode"
import type { UserErrorCode } from "../types/users/errorCode"
import { commonErrorMessageMap } from "./common"
import { projectErrorMessageMap } from "./projects"
import { projectUpdateErrorMessageMap } from "./projectUpdates"
import { siteLinkErrorMessageMap } from "./siteLinks"
import { siteSettingsErrorMessageMap } from "./siteSettings"
import { userErrorMessageMap } from "./users"

export type ErrorCode =
  | CommonErrorCode
  | UserErrorCode
  | ProjectErrorCode
  | ProjectUpdateErrorCode
  | SiteLinkErrorCode
  | SiteSettingsErrorCode

/** Mensagem padrão de cada código, usada quando o service não manda uma própria */
export const errorMessageMap: Record<ErrorCode, string> = {
  ...commonErrorMessageMap,
  ...userErrorMessageMap,
  ...projectErrorMessageMap,
  ...projectUpdateErrorMessageMap,
  ...siteLinkErrorMessageMap,
  ...siteSettingsErrorMessageMap,
}
