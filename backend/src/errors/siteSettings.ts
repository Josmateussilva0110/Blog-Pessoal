import { SiteSettingsErrorCode } from "../types/siteSettings/errorCode"

export const siteSettingsErrorHttpStatusMap: Record<SiteSettingsErrorCode, number> = {
  [SiteSettingsErrorCode.SITE_SETTINGS_FETCH_FAILED]: 500,
  [SiteSettingsErrorCode.SITE_SETTINGS_UPDATE_FAILED]: 500,
}

export const siteSettingsErrorMessageMap: Record<SiteSettingsErrorCode, string> = {
  [SiteSettingsErrorCode.SITE_SETTINGS_FETCH_FAILED]: "Erro ao carregar estatísticas.",
  [SiteSettingsErrorCode.SITE_SETTINGS_UPDATE_FAILED]: "Erro ao atualizar estatísticas.",
}
