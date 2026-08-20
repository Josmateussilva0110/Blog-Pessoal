import { SiteLinkErrorCode } from "../types/code/siteLinkCode"

export const siteLinkErrorHttpStatusMap: Record<SiteLinkErrorCode, number> = {
  [SiteLinkErrorCode.SITE_LINK_FETCH_FAILED]: 500,
  [SiteLinkErrorCode.SITE_LINK_UPDATE_FAILED]: 500,
}
