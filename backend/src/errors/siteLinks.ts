import { SiteLinkErrorCode } from "../types/siteLinks/errorCode"

export const siteLinkErrorHttpStatusMap: Record<SiteLinkErrorCode, number> = {
  [SiteLinkErrorCode.SITE_LINK_FETCH_FAILED]: 500,
  [SiteLinkErrorCode.SITE_LINK_UPDATE_FAILED]: 500,
}

export const siteLinkErrorMessageMap: Record<SiteLinkErrorCode, string> = {
  [SiteLinkErrorCode.SITE_LINK_FETCH_FAILED]: "Erro ao carregar links do site.",
  [SiteLinkErrorCode.SITE_LINK_UPDATE_FAILED]: "Erro ao atualizar links do site.",
}
