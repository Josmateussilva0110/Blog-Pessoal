/** Confere o código SQLSTATE que o PostgREST repassa no erro */
export function isPostgresError(error: { code?: string } | null, sqlState: string): boolean {
  return error?.code === sqlState
}
