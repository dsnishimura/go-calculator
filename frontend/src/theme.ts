export type Theme = 'light' | 'dark'

/** The OS/browser's current color-scheme preference, used as the toggle's initial state. */
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}
