export type ServiceResult<T = void, E extends string = string> =
  | {
      status: true
      data: T
    }
  | {
      status: false
      error: ServiceError<E>
    }

export interface ServiceError<E extends string = string> {
  code: E
  message?: string
}

export type { CreatedId } from "@blog/shared"
