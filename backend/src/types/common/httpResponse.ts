export interface FieldError {
  field: string
  message: string
}

/** Formato único de toda resposta da API — o cliente tem um só parser */
export interface HttpResponse<T = unknown> {
  success: boolean
  message: string
  code?: string
  data?: T
  errors?: FieldError[]
}
