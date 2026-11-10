import { beforeEach, describe, expect, it, vi } from "vitest"
import { createSupabaseModuleMock } from "../test/supabaseMock"

vi.mock("../database/supabase/supabase", () => createSupabaseModuleMock())

import { supabaseAdmin } from "../database/supabase/supabase"
import { SiteLinkErrorCode } from "../types/siteLinks/errorCode"
import SiteLinkService from "./SiteLinkService"

const rpc = vi.mocked(supabaseAdmin.rpc)
const payload = { nav: [{ label: "home", href: "/" }], social: [], skill: [] }

describe("SiteLinkService.replaceAll", () => {
  beforeEach(() => {
    rpc.mockReset()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("troca os links numa única chamada à função do banco", async () => {
    rpc.mockResolvedValue({ data: null, error: null } as never)

    expect(await SiteLinkService.replaceAll(payload as never)).toEqual({ status: true, data: null })
    expect(rpc).toHaveBeenCalledTimes(1)
    expect(rpc.mock.calls[0][1]).toEqual({
      p_links: [expect.objectContaining({ category: "nav", label: "home", sort_order: 0 })],
    })
  })

  it("falha da função vira UPDATE_FAILED", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "boom" } } as never)

    expect(await SiteLinkService.replaceAll(payload as never)).toEqual({
      status: false,
      error: { code: SiteLinkErrorCode.SITE_LINK_UPDATE_FAILED },
    })
  })
})
