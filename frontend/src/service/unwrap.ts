import type { ApiResponse } from "./types";

/** Converte a resposta da API em dado ou exceção, para o React Query marcar a query como erro */
export function unwrap<T>(result: ApiResponse<T>): T {
  if (!result.success) {
    throw new Error(result.message);
  }
  return result.data;
}
