import { beforeEach, describe, expect, it, vi } from "vitest"
import { createSupabaseModuleMock, queryResult } from "../test/supabaseMock"

vi.mock("../database/supabase/supabase", () => createSupabaseModuleMock())

import { supabaseAdmin } from "../database/supabase/supabase"
import { ProjectUpdateErrorCode } from "../types/projectUpdates/errorCode"
import ProjectUpdateService from "./ProjectUpdateService"

const from = vi.mocked(supabaseAdmin.from)
const PROJECT_ID = "22222222-2222-4222-8222-222222222222"
const UPDATE_ID = "33333333-3333-4333-8333-333333333333"
const PAYLOAD = { title: "v1", contentMarkdown: "texto", publishedAt: "2026-11-09T12:00:00.000Z", version: undefined }
const PAGE = { page: 1, limit: 20 }

const updateRow = {
  id: UPDATE_ID,
  project_id: PROJECT_ID,
  title: "v1",
  version: null,
  content_markdown: "texto",
  published_at: "2026-11-09T12:00:00.000Z",
  created_at: "2026-11-09T12:00:00.000Z",
  updated_at: "2026-11-09T12:00:00.000Z",
}

describe("ProjectUpdateService", () => {
  beforeEach(() => {
    from.mockReset()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("lista com paginação dentro de data", async () => {
    from.mockReturnValue(queryResult({ data: [updateRow], count: 1 }) as never)

    const result = await ProjectUpdateService.listByProject(PROJECT_ID, PAGE)

    expect(result).toEqual({
      status: true,
      data: { items: [expect.objectContaining({ id: UPDATE_ID, projectId: PROJECT_ID })], pagination: { page: 1, limit: 20, total: 1 } },
    })
  })

  it("falha do banco na lista vira FETCH_FAILED", async () => {
    from.mockReturnValue(queryResult({ error: { message: "boom" } }) as never)

    const result = await ProjectUpdateService.listByProject(PROJECT_ID, PAGE)

    expect(result).toEqual({ status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_FETCH_FAILED } })
  })

  it("create devolve só o id", async () => {
    from.mockReturnValue(queryResult({ data: { id: UPDATE_ID } }) as never)

    const result = await ProjectUpdateService.create(PROJECT_ID, PAYLOAD)

    expect(result).toEqual({ status: true, data: { id: UPDATE_ID } })
  })

  it("create em projeto inexistente (violação de FK) vira PROJECT_NOT_FOUND", async () => {
    from.mockReturnValue(queryResult({ error: { code: "23503", message: "fk" } }) as never)

    const result = await ProjectUpdateService.create(PROJECT_ID, PAYLOAD)

    expect(result).toEqual({ status: false, error: { code: ProjectUpdateErrorCode.PROJECT_NOT_FOUND } })
  })

  it("create com outra falha do banco vira SAVE_FAILED", async () => {
    from.mockReturnValue(queryResult({ error: { code: "XX000", message: "boom" } }) as never)

    const result = await ProjectUpdateService.create(PROJECT_ID, PAYLOAD)

    expect(result).toEqual({ status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_SAVE_FAILED } })
  })

  it("update de atualização de outro projeto (nenhuma linha) vira NOT_FOUND", async () => {
    from.mockReturnValue(queryResult({ data: null }) as never)

    const result = await ProjectUpdateService.update(PROJECT_ID, UPDATE_ID, PAYLOAD)

    expect(result).toEqual({ status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_NOT_FOUND } })
  })

  it("update com falha do banco vira SAVE_FAILED", async () => {
    from.mockReturnValue(queryResult({ error: { message: "boom" } }) as never)

    const result = await ProjectUpdateService.update(PROJECT_ID, UPDATE_ID, PAYLOAD)

    expect(result).toEqual({ status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_SAVE_FAILED } })
  })

  it("remove sem linha apagada vira NOT_FOUND", async () => {
    from.mockReturnValue(queryResult({ data: [] }) as never)

    const result = await ProjectUpdateService.remove(PROJECT_ID, UPDATE_ID)

    expect(result).toEqual({ status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_NOT_FOUND } })
  })

  it("remove com falha do banco vira DELETE_FAILED", async () => {
    from.mockReturnValue(queryResult({ error: { message: "boom" } }) as never)

    const result = await ProjectUpdateService.remove(PROJECT_ID, UPDATE_ID)

    expect(result).toEqual({ status: false, error: { code: ProjectUpdateErrorCode.PROJECT_UPDATE_DELETE_FAILED } })
  })

  it("remove com sucesso", async () => {
    from.mockReturnValue(queryResult({ data: [{ id: UPDATE_ID }] }) as never)

    expect(await ProjectUpdateService.remove(PROJECT_ID, UPDATE_ID)).toEqual({ status: true, data: null })
  })
})
