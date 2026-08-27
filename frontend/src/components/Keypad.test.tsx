import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Keypad } from './Keypad'

describe('Keypad', () => {
  it('renders digits 0-9 and a decimal point', () => {
    render(<Keypad onPress={() => {}} />)
    for (const digit of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      expect(screen.getByRole('button', { name: digit })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: '.' })).toBeInTheDocument()
  })

  it('calls onPress with the clicked key', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()
    render(<Keypad onPress={onPress} />)

    await user.click(screen.getByRole('button', { name: '7' }))
    await user.click(screen.getByRole('button', { name: '.' }))

    expect(onPress).toHaveBeenNthCalledWith(1, '7')
    expect(onPress).toHaveBeenNthCalledWith(2, '.')
  })
})
