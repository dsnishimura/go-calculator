import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CalculatorPad } from './CalculatorPad'

function renderPad(overrides: Partial<ComponentProps<typeof CalculatorPad>> = {}) {
  const props = {
    pendingOperation: null,
    isLoading: false,
    canEquals: true,
    onDigit: vi.fn(),
    onOperator: vi.fn(),
    onEquals: vi.fn(),
    onClear: vi.fn(),
    ...overrides,
  }
  render(<CalculatorPad {...props} />)
  return props
}

describe('CalculatorPad', () => {
  it('renders every digit, the decimal point, all seven operations, AC, and =', () => {
    renderPad()
    for (const digit of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
      expect(screen.getByRole('button', { name: digit })).toBeInTheDocument()
    }
    for (const symbol of ['.', '+', '−', '×', '÷', 'xʸ', '√', '%', 'AC', '=']) {
      expect(screen.getByRole('button', { name: symbol })).toBeInTheDocument()
    }
  })

  it('calls onDigit with the pressed digit', async () => {
    const user = userEvent.setup()
    const props = renderPad()
    await user.click(screen.getByRole('button', { name: '7' }))
    expect(props.onDigit).toHaveBeenCalledWith('7')
  })

  it('calls onOperator with the matching operation for every operator key', async () => {
    const user = userEvent.setup()
    const props = renderPad()
    const cases: [string, string][] = [
      ['÷', 'divide'],
      ['×', 'multiply'],
      ['−', 'subtract'],
      ['+', 'add'],
      ['xʸ', 'power'],
      ['√', 'sqrt'],
      ['%', 'percentage'],
    ]
    for (const [symbol, operation] of cases) {
      await user.click(screen.getByRole('button', { name: symbol }))
      expect(props.onOperator).toHaveBeenLastCalledWith(operation)
    }
  })

  it('marks the pending operator as pressed', () => {
    renderPad({ pendingOperation: 'multiply' })
    expect(screen.getByRole('button', { name: '×' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '÷' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onClear when AC is pressed', async () => {
    const user = userEvent.setup()
    const props = renderPad()
    await user.click(screen.getByRole('button', { name: 'AC' }))
    expect(props.onClear).toHaveBeenCalled()
  })

  it('disables = when canEquals is false, and shows a loading indicator while isLoading', () => {
    const { rerender } = render(
      <CalculatorPad
        pendingOperation={null}
        isLoading={false}
        canEquals={false}
        onDigit={() => {}}
        onOperator={() => {}}
        onEquals={() => {}}
        onClear={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: '=' })).toBeDisabled()

    rerender(
      <CalculatorPad
        pendingOperation="add"
        isLoading
        canEquals
        onDigit={() => {}}
        onOperator={() => {}}
        onEquals={() => {}}
        onClear={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: '…' })).toBeDisabled()
  })
})
