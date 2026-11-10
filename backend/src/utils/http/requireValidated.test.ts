import type { Request } from "express"
import { describe, expect, it } from "vitest"
import { IdParamSchema } from "../../schemas/common/idParam"
import { PaginationQuerySchema } from "../../schemas/common/pagination"
import { requireValidated } from "./requireValidated"

function fakeRequest(validated: Request["validated"]) {
  return { validated, method: "GET", originalUrl: "/api/projects" }
}

describe("requireValidated", () => {
  it("devolve o dado convertido quando a rota validou com o mesmo schema", () => {
    const request = fakeRequest({ query: { schema: PaginationQuerySchema, data: { page: 2, limit: 10 } } })

    expect(requireValidated(request, "query", PaginationQuerySchema)).toEqual({ page: 2, limit: 10 })
  })

  it("lança quando a rota não passou pelo validate", () => {
    expect(() => requireValidated(fakeRequest(undefined), "query", PaginationQuerySchema)).toThrow(
      "query sem validate em GET /api/projects"
    )
  })

  it("lança quando a rota validou outro alvo", () => {
    const request = fakeRequest({ params: { schema: IdParamSchema, data: { id: "x" } } })

    expect(() => requireValidated(request, "query", PaginationQuerySchema)).toThrow("query sem validate")
  })

  it("lança quando a rota validou com outro schema", () => {
    const request = fakeRequest({ query: { schema: IdParamSchema, data: { id: "x" } } })

    expect(() => requireValidated(request, "query", PaginationQuerySchema)).toThrow("validado com outro schema")
  })
})
