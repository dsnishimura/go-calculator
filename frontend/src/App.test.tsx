import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

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
  document.documentElement.removeAttribute('data-theme')
})

describe('App', () => {
  it('initializes the theme attribute from the OS preference (dark)', () => {
    mockMatchMedia(false)
    render(<App />)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('initializes the theme attribute from the OS preference (light)', () => {
    mockMatchMedia(true)
    render(<App />)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles the theme attribute when the switch is pressed', async () => {
    mockMatchMedia(false)
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('switch'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    await user.click(screen.getByRole('switch'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('renders the calculator', () => {
    mockMatchMedia(false)
    render(<App />)
    expect(screen.getByTestId('display')).toBeInTheDocument()
  })
})
