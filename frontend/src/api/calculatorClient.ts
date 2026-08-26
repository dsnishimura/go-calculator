import type { ApiErrorBody, CalculateResponse, Operation } from '../types/calculator'

/** Thrown when the backend returns a structured error response. */
export class ApiError extends Error {
  code: string

  constructor(body: ApiErrorBody) {
    super(body.message)
    this.name = 'ApiError'
    this.code = body.code
  }
}

/** Thrown when the request never reached the backend (network failure). */
export class NetworkError extends Error {
  cause?: unknown

  constructor(cause: unknown) {
    super('Could not reach the server. Check your connection and try again.')
    this.name = 'NetworkError'
    this.cause = cause
  }
}

export async function calculate(operation: Operation, operands: number[]): Promise<CalculateResponse> {
  let response: Response
  try {
    response = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation, operands }),
    })
  } catch (cause) {
    throw new NetworkError(cause)
  }

  const body = await response.json()

  if (!response.ok) {
    throw new ApiError(body.error)
  }

  return body as CalculateResponse
}
