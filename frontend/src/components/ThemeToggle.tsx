import type { Theme } from '../theme'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className="theme-toggle"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      onClick={onToggle}
    >
      <span aria-hidden="true">{isDark ? '🌙' : '☀️'}</span>
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb" />
      </span>
    </button>
  )
}
