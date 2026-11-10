import { vi } from "vitest"

type QueryOutcome = { data?: unknown; error?: unknown; count?: number | null }

/**
 * Imita o query builder do supabase-js: qualquer método encadeado devolve o próprio
 * builder, e o await resolve com o resultado dado. Os testes conferem o ServiceResult,
 * não a montagem da query.
 */
export function queryResult({ data = null, error = null, count = null }: QueryOutcome) {
  const outcome = { data, error, count }
  const builder: Record<string | symbol, unknown> = new Proxy(
    {},
    {
      get(_target, property) {
        if (property === "then") {
          return (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
            Promise.resolve(outcome).then(resolve, reject)
        }
        return () => builder
      },
    },
  )
  return builder
}

/** Fábrica usada nos vi.mock do módulo database/supabase/supabase */
export function createSupabaseModuleMock() {
  return {
    supabaseAdmin: {
      from: vi.fn(),
      rpc: vi.fn(),
      auth: { getUser: vi.fn(async () => ({ data: { user: null }, error: { message: "invalid" } })) },
    },
    supabaseAuth: { auth: { signInWithPassword: vi.fn(), refreshSession: vi.fn() } },
    createEphemeralAuthClient: vi.fn(),
    createSupabaseClientForUser: vi.fn(),
  }
}
