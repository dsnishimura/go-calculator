import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSystemTheme } from './theme'

function mockMatchMedia(prefersLight: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: light)' ? prefersLight : false,
      media: query,
    })),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getSystemTheme', () => {
  it('returns "light" when the OS prefers light', () => {
    mockMatchMedia(true)
    expect(getSystemTheme()).toBe('light')
  })

  it('returns "dark" when the OS prefers dark', () => {
    mockMatchMedia(false)
    expect(getSystemTheme()).toBe('dark')
  })

  it('falls back to "dark" when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(getSystemTheme()).toBe('dark')
  })
})
