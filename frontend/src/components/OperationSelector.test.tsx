import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OperationSelector } from './OperationSelector'

describe('OperationSelector', () => {
  it('renders a button for every operation and marks the pending one', () => {
    render(<OperationSelector pendingOperation="add" onPress={() => {}} />)
    const pending = screen.getByRole('button', { name: '+' })
    expect(pending).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '√' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('marks no operation as pending when null', () => {
    render(<OperationSelector pendingOperation={null} onPress={() => {}} />)
    expect(screen.getByRole('button', { name: '+' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onPress with the clicked operation', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()
    render(<OperationSelector pendingOperation={null} onPress={onPress} />)

    await user.click(screen.getByRole('button', { name: '÷' }))

    expect(onPress).toHaveBeenCalledWith('divide')
  })
})
