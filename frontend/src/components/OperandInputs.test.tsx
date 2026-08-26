import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OperandInputs } from './OperandInputs'

describe('OperandInputs', () => {
  it('renders both inputs for a binary operation', () => {
    render(<OperandInputs operation="add" a="" b="" onChangeA={() => {}} onChangeB={() => {}} />)
    expect(screen.getByLabelText('First number')).toBeInTheDocument()
    expect(screen.getByLabelText('Second number')).toBeInTheDocument()
  })

  it('renders only one input for a unary operation', () => {
    render(<OperandInputs operation="sqrt" a="" b="" onChangeA={() => {}} onChangeB={() => {}} />)
    expect(screen.getByLabelText('Number')).toBeInTheDocument()
    expect(screen.queryByLabelText('Second number')).not.toBeInTheDocument()
  })

  it('calls onChangeA and onChangeB as the user types', async () => {
    const user = userEvent.setup()
    const onChangeA = vi.fn()
    const onChangeB = vi.fn()
    render(<OperandInputs operation="add" a="" b="" onChangeA={onChangeA} onChangeB={onChangeB} />)

    await user.type(screen.getByLabelText('First number'), '4')
    await user.type(screen.getByLabelText('Second number'), '5')

    expect(onChangeA).toHaveBeenCalledWith('4')
    expect(onChangeB).toHaveBeenCalledWith('5')
  })
})
