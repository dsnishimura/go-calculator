import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, NetworkError, calculate } from './calculatorClient'

afterEach(() => {
  vi.unstubAllGlobals()
})

function mockFetch(response: { ok: boolean; json: () => Promise<unknown> }) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
}

describe('calculate', () => {
  it('returns the parsed result on success', async () => {
    mockFetch({
      ok: true,
      json: async () => ({ operation: 'add', operands: [4, 5], result: 9 }),
    })

    const result = await calculate('add', [4, 5])
    expect(result).toEqual({ operation: 'add', operands: [4, 5], result: 9 })
    expect(fetch).toHaveBeenCalledWith(
      '/api/calculate',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ operation: 'add', operands: [4, 5] }),
      }),
    )
  })

  it('throws an ApiError with the backend code and message on a structured error', async () => {
    mockFetch({
      ok: false,
      json: async () => ({ error: { code: 'DIVISION_BY_ZERO', message: 'cannot divide by zero' } }),
    })

    await expect(calculate('divide', [1, 0])).rejects.toMatchObject(
      new ApiError({ code: 'DIVISION_BY_ZERO', message: 'cannot divide by zero' }),
    )
  })

  it('throws a NetworkError when the request fails outright', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    )

    await expect(calculate('add', [1, 2])).rejects.toBeInstanceOf(NetworkError)
  })
})
