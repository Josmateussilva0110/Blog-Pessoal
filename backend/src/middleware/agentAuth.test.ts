import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE } from "@blog/shared"
import { createSupabaseModuleMock } from "../test/supabaseMock"

vi.mock("../database/supabase/supabase", () => createSupabaseModuleMock())

import { app } from "../app"
import { supabaseAdmin } from "../database/supabase/supabase"

const from = vi.mocked(supabaseAdmin.from)
const PROJECT_ID = "22222222-2222-4222-8222-222222222222"
const csrf = { [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE }
const agent = { ...csrf, Authorization: `Bearer ${process.env.AGENT_API_KEY}` }

describe("chave do agente de publicação", () => {
  beforeEach(() => {
    from.mockReset()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    vi.spyOn(console, "warn").mockImplementation(() => undefined)
  })

  it("chave certa passa da autenticação ao criar atualização (chega na validação)", async () => {
    const response = await request(app).post(`/api/projects/${PROJECT_ID}/updates`).set(agent).send({})

    expect(response.status).toBe(422)
    expect(response.body.code).toBe("VALIDATION_ERROR")
  })

  it("chave certa passa da autenticação ao criar projeto (chega na validação)", async () => {
    const response = await request(app).post("/api/projects").set(agent).field("data", "{}")

    expect(response.status).toBe(422)
    expect(response.body.code).toBe("VALIDATION_ERROR")
  })

  it("chave errada responde 401 sem tocar no banco", async () => {
    const response = await request(app)
      .post(`/api/projects/${PROJECT_ID}/updates`)
      .set({ ...csrf, Authorization: "Bearer chave-errada" })
      .send({})

    expect(response.status).toBe(401)
    expect(response.body.code).toBe("UNAUTHORIZED")
    expect(from).not.toHaveBeenCalled()
  })

  it("esquema diferente de Bearer é recusado", async () => {
    const response = await request(app)
      .post(`/api/projects/${PROJECT_ID}/updates`)
      .set({ ...csrf, Authorization: `Basic ${process.env.AGENT_API_KEY}` })
      .send({})

    expect(response.status).toBe(401)
  })

  it("a chave não serve para apagar projeto", async () => {
    const response = await request(app).delete(`/api/projects/${PROJECT_ID}`).set(agent)

    expect(response.status).toBe(401)
    expect(from).not.toHaveBeenCalled()
  })

  it("a chave não serve para editar projeto", async () => {
    const response = await request(app).put(`/api/projects/${PROJECT_ID}`).set(agent).field("data", "{}")

    expect(response.status).toBe(401)
  })

  it("sem chave e sem sessão continua 401", async () => {
    const response = await request(app).post(`/api/projects/${PROJECT_ID}/updates`).set(csrf).send({})

    expect(response.status).toBe(401)
  })
})
