import { SiteSettingsErrorCode } from "../types/code/siteSettingsCode"

export const siteSettingsErrorHttpStatusMap: Record<SiteSettingsErrorCode, number> = {
  [SiteSettingsErrorCode.SITE_SETTINGS_FETCH_FAILED]: 500,
  [SiteSettingsErrorCode.SITE_SETTINGS_UPDATE_FAILED]: 500,
}
