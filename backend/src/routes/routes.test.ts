import jwt from "jsonwebtoken"
import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE } from "@blog/shared"
import { createSupabaseModuleMock, queryResult } from "../test/supabaseMock"

vi.mock("../database/supabase/supabase", () => createSupabaseModuleMock())

import { app } from "../app"
import { supabaseAdmin } from "../database/supabase/supabase"

const from = vi.mocked(supabaseAdmin.from)
const ORIGIN = "http://localhost:5173"
const csrf = { [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE, Origin: ORIGIN }

function accessCookie(userId: string) {
  const token = jwt.sign({ sub: userId }, process.env.SUPABASE_JWT_SECRET as string, {
    algorithm: "HS256",
    expiresIn: 60,
  })
  return `blog_at=${token}`
}

/** Todo corpo da API, sucesso ou falha, segue o envelope */
function expectEnvelope(body: Record<string, unknown>, success: boolean) {
  expect(body.success).toBe(success)
  expect(typeof body.message).toBe("string")
  if (!success) expect(typeof body.code).toBe("string")
}

describe("contrato das rotas", () => {
  beforeEach(() => {
    from.mockReset()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    vi.spyOn(console, "warn").mockImplementation(() => undefined)
  })

  it("health responde no envelope", async () => {
    const response = await request(app).get("/api/health")

    expect(response.status).toBe(200)
    expectEnvelope(response.body, true)
  })

  it("rota inexistente responde 404 em JSON com ROUTE_NOT_FOUND", async () => {
    const response = await request(app).get("/api/nao-existe")

    expect(response.status).toBe(404)
    expectEnvelope(response.body, false)
    expect(response.body.code).toBe("ROUTE_NOT_FOUND")
  })

  it("mutação sem o header de CSRF é recusada", async () => {
    const response = await request(app).post("/api/login").send({ email: "a@b.com", password: "x" })

    expect(response.status).toBe(403)
    expect(response.body.code).toBe("CSRF_REJECTED")
  })

  it("validação responde 422 com errors[].field", async () => {
    const response = await request(app).post("/api/login").set(csrf).send({ email: "invalido" })

    expect(response.status).toBe(422)
    expectEnvelope(response.body, false)
    expect(response.body.code).toBe("VALIDATION_ERROR")
    expect(response.body.errors.map((error: { field: string }) => error.field)).toContain("email")
  })

  it("JSON malformado responde 400 sem vazar detalhe", async () => {
    const response = await request(app)
      .post("/api/login")
      .set({ ...csrf, "Content-Type": "application/json" })
      .send("{ quebrado")

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      success: false,
      message: "Corpo da requisição inválido.",
      code: "INVALID_JSON",
    })
  })

  it("rota protegida sem sessão responde 401 UNAUTHORIZED", async () => {
    const response = await request(app).get("/api/profile")

    expect(response.status).toBe(401)
    expectEnvelope(response.body, false)
    expect(response.body.code).toBe("UNAUTHORIZED")
  })

  it("conta que não é o admin recebe 403, nunca os dados do admin", async () => {
    const response = await request(app)
      .get("/api/projects/admin")
      .set("Cookie", accessCookie("99999999-9999-4999-8999-999999999999"))

    expect(response.status).toBe(403)
    expect(response.body.code).toBe("FORBIDDEN")
    expect(from).not.toHaveBeenCalled()
  })

  it("refresh sem cookie responde 401 SESSION_EXPIRED", async () => {
    const response = await request(app).post("/api/auth/refresh").set(csrf)

    expect(response.status).toBe(401)
    expect(response.body.code).toBe("SESSION_EXPIRED")
  })

  it("limit acima do teto é recusado", async () => {
    const response = await request(app).get("/api/projects?limit=100000")

    expect(response.status).toBe(422)
    expect(response.body.errors[0].field).toBe("limit")
  })

  it("lista pública devolve items e pagination dentro de data", async () => {
    from.mockReturnValue(queryResult({ data: [], count: 0 }) as never)

    const response = await request(app).get("/api/projects?page=2&limit=5")

    expect(response.status).toBe(200)
    expectEnvelope(response.body, true)
    expect(response.body.data).toEqual({ items: [], pagination: { page: 2, limit: 5, total: 0 } })
  })

  it("projeto inexistente responde 404 com o code do domínio", async () => {
    from.mockReturnValue(queryResult({ data: null }) as never)

    const response = await request(app).get("/api/projects/nao-existe")

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      message: "Projeto não encontrado.",
      code: "PROJECT_NOT_FOUND",
    })
  })

  it("falha do banco responde 500 com mensagem genérica", async () => {
    from.mockReturnValue(queryResult({ error: { message: 'relation "projects" column secret_col' } }) as never)

    const response = await request(app).get("/api/projects/qualquer")

    expect(response.status).toBe(500)
    expect(JSON.stringify(response.body)).not.toContain("secret_col")
    expect(response.body.code).toBe("PROJECT_FETCH_FAILED")
  })
})
