import { beforeEach, describe, expect, it, vi } from "vitest"
import { createSupabaseModuleMock, queryResult } from "../test/supabaseMock"

vi.mock("../database/supabase/supabase", () => createSupabaseModuleMock())

import { supabaseAdmin } from "../database/supabase/supabase"
import { ProjectErrorCode } from "../types/projects/errorCode"
import ProjectService from "./ProjectService"

const from = vi.mocked(supabaseAdmin.from)
const PROJECT_ID = "22222222-2222-4222-8222-222222222222"
const USER_ID = "11111111-1111-4111-8111-111111111111"

const projectRow = {
  id: PROJECT_ID,
  slug: "meu-projeto",
  title: "Meu projeto",
  description: "Resumo",
  content_markdown: "# Texto",
  status: "wip",
  platform: "web",
  tech_stack: ["ts"],
  repo_url: null,
  cover_image_url: null,
  images: [],
  markdown_files: [],
  featured: false,
  created_at: "2026-11-09T12:00:00.000Z",
  updated_at: "2026-11-09T12:00:00.000Z",
}

const payload = {
  title: "Meu projeto",
  slug: "meu-projeto",
  contentMarkdown: "# Texto",
  description: "Resumo",
  status: "wip" as const,
  platform: "web" as const,
  techStack: ["ts"],
  featured: false,
  images: [],
}

describe("ProjectService", () => {
  beforeEach(() => {
    from.mockReset()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("getById mapeia a linha para o tipo da API", async () => {
    from.mockReturnValue(queryResult({ data: projectRow }) as never)

    const result = await ProjectService.getById(PROJECT_ID)

    expect(result.status).toBe(true)
    if (result.status) expect(result.data).toMatchObject({ id: PROJECT_ID, techStack: ["ts"], repoUrl: undefined })
  })

  it("getById sem linha vira NOT_FOUND", async () => {
    from.mockReturnValue(queryResult({ data: null }) as never)

    expect(await ProjectService.getById(PROJECT_ID)).toEqual({
      status: false,
      error: { code: ProjectErrorCode.PROJECT_NOT_FOUND },
    })
  })

  it("getById com falha do banco vira FETCH_FAILED, não NOT_FOUND", async () => {
    from.mockReturnValue(queryResult({ error: { message: "boom" } }) as never)

    expect(await ProjectService.getById(PROJECT_ID)).toEqual({
      status: false,
      error: { code: ProjectErrorCode.PROJECT_FETCH_FAILED },
    })
  })

  it("list devolve itens e paginação", async () => {
    from.mockReturnValue(queryResult({ data: [projectRow], count: 7 }) as never)

    const result = await ProjectService.list({ page: 2, limit: 1 })

    expect(result.status).toBe(true)
    if (result.status) expect(result.data.pagination).toEqual({ page: 2, limit: 1, total: 7 })
  })

  it("create com slug em uso vira SLUG_EXISTS", async () => {
    from.mockReturnValue(queryResult({ data: { id: "outro" } }) as never)

    expect(await ProjectService.create(USER_ID, payload, [])).toEqual({
      status: false,
      error: { code: ProjectErrorCode.PROJECT_SLUG_EXISTS },
    })
  })

  it("create com URL de imagem externa vira ASSET_INVALID sem tocar no banco", async () => {
    const result = await ProjectService.create(USER_ID, { ...payload, images: ["https://rastreio.example/x.png"] }, [])

    expect(result).toMatchObject({ status: false, error: { code: ProjectErrorCode.PROJECT_ASSET_INVALID } })
    expect(from).not.toHaveBeenCalled()
  })

  it("create sem imagens devolve só o id", async () => {
    from
      .mockReturnValueOnce(queryResult({ data: null }) as never)
      .mockReturnValueOnce(queryResult({ data: { id: PROJECT_ID } }) as never)

    expect(await ProjectService.create(USER_ID, payload, [])).toEqual({ status: true, data: { id: PROJECT_ID } })
  })

  it("remove sem linha apagada vira NOT_FOUND", async () => {
    from.mockReturnValue(queryResult({ data: [] }) as never)

    expect(await ProjectService.remove(PROJECT_ID)).toEqual({
      status: false,
      error: { code: ProjectErrorCode.PROJECT_NOT_FOUND },
    })
  })
})
