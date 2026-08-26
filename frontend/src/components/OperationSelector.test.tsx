import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OperationSelector } from './OperationSelector'

describe('OperationSelector', () => {
  it('renders a button for every operation and marks the selected one', () => {
    render(<OperationSelector value="add" onChange={() => {}} />)
    const selected = screen.getByRole('button', { name: '+' })
    expect(selected).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '√' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChange with the clicked operation', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<OperationSelector value="add" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: '÷' }))

    expect(onChange).toHaveBeenCalledWith('divide')
  })
})
