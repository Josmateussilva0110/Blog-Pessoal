import { beforeEach, describe, expect, it, vi } from "vitest"
import { createSupabaseModuleMock, queryResult } from "../test/supabaseMock"

vi.mock("../database/supabase/supabase", () => createSupabaseModuleMock())

import { createSupabaseClientForUser } from "../database/supabase/supabase"
import { UserErrorCode } from "../types/users/errorCode"
import UserService from "./UserService"

const clientForUser = vi.mocked(createSupabaseClientForUser)
const USER_ID = "11111111-1111-4111-8111-111111111111"

function userClientReturning(outcome: Parameters<typeof queryResult>[0]) {
  clientForUser.mockReturnValue({ from: () => queryResult(outcome) } as never)
}

describe("UserService", () => {
  beforeEach(() => {
    clientForUser.mockReset()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("getProfile sem linha vira USER_NOT_FOUND", async () => {
    userClientReturning({ data: null })

    expect(await UserService.getProfile(USER_ID)).toEqual({
      status: false,
      error: { code: UserErrorCode.USER_NOT_FOUND },
    })
  })

  it("getProfile com falha do banco vira USER_FETCH_FAILED", async () => {
    userClientReturning({ error: { message: "boom" } })

    expect(await UserService.getProfile(USER_ID)).toEqual({
      status: false,
      error: { code: UserErrorCode.USER_FETCH_FAILED },
    })
  })

  it("updateProfile devolve só o id", async () => {
    userClientReturning({ data: { id: USER_ID } })

    expect(await UserService.updateProfile(USER_ID, { username: "mateus" })).toEqual({
      status: true,
      data: { id: USER_ID },
    })
  })

  it("troca de senha fora da obrigatória exige a senha atual", async () => {
    userClientReturning({ data: { email: "a@b.com", must_change_password: false } })

    const result = await UserService.changePassword(USER_ID, {
      new_password: "NovaSenha@123",
      confirm_password: "NovaSenha@123",
    })

    expect(result).toEqual({ status: false, error: { code: UserErrorCode.INVALID_PASSWORD } })
  })
})
