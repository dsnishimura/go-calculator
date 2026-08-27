import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle', () => {
  it('is checked when the theme is dark', () => {
    render(<ThemeToggle theme="dark" onToggle={() => {}} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('is unchecked when the theme is light', () => {
    render(<ThemeToggle theme="light" onToggle={() => {}} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onToggle when pressed', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<ThemeToggle theme="dark" onToggle={onToggle} />)

    await user.click(screen.getByRole('switch'))

    expect(onToggle).toHaveBeenCalled()
  })
})
