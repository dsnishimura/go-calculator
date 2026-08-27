import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Calculator } from './Calculator'
import * as client from '../api/calculatorClient'

afterEach(() => {
  vi.restoreAllMocks()
})

function pressDigits(user: ReturnType<typeof userEvent.setup>, digits: string) {
  return Promise.all(
    digits.split('').map((d) => user.click(screen.getByRole('button', { name: d }))),
  )
}

describe('Calculator', () => {
  it('starts showing 0', () => {
    render(<Calculator />)
    expect(screen.getByTestId('display')).toHaveTextContent('0')
  })

  it('toggles the sign of the current entry, and builds a negative multi-digit number', async () => {
    vi.spyOn(client, 'calculate').mockResolvedValue({ operation: 'add', operands: [-53, 2], result: -51 })
    const user = userEvent.setup()
    render(<Calculator />)

    await pressDigits(user, '5')
    await user.click(screen.getByRole('button', { name: '±' }))
    expect(screen.getByTestId('display')).toHaveTextContent('-5')

    await pressDigits(user, '3')
    expect(screen.getByTestId('display')).toHaveTextContent('-53')

    await user.click(screen.getByRole('button', { name: '±' }))
    expect(screen.getByTestId('display')).toHaveTextContent('53')

    await user.click(screen.getByRole('button', { name: '±' }))
    await user.click(screen.getByRole('button', { name: '+' }))
    await pressDigits(user, '2')
    await user.click(screen.getByRole('button', { name: '=' }))

    await waitFor(() => expect(client.calculate).toHaveBeenCalledWith('add', [-53, 2]))
  })

  it('does nothing when toggling the sign of an untouched 0', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.click(screen.getByRole('button', { name: '±' }))

    expect(screen.getByTestId('display')).toHaveTextContent('0')
  })

  it('shows a running expression line once an operator is confirmed', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    expect(screen.getByTestId('display-expression')).toHaveTextContent('')

    await pressDigits(user, '4')
    await user.click(screen.getByRole('button', { name: '+' }))

    expect(screen.getByTestId('display-expression')).toHaveTextContent('4 +')
  })

  it('supports entry via the physical keyboard', async () => {
    vi.spyOn(client, 'calculate').mockResolvedValue({ operation: 'add', operands: [4, 5], result: 9 })
    const user = userEvent.setup()
    render(<Calculator />)

    await user.keyboard('4+5')
    await user.keyboard('{Enter}')

    await waitFor(() => expect(screen.getByTestId('display')).toHaveTextContent('9'))
    expect(client.calculate).toHaveBeenCalledWith('add', [4, 5])
  })

  it('clears via the Escape key', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.keyboard('42')
    expect(screen.getByTestId('display')).toHaveTextContent('42')

    await user.keyboard('{Escape}')
    expect(screen.getByTestId('display')).toHaveTextContent('0')
  })

  it('types a number, confirms it with an operator, types the second number, and computes on =', async () => {
    vi.spyOn(client, 'calculate').mockResolvedValue({ operation: 'add', operands: [4, 5], result: 9 })
    const user = userEvent.setup()
    render(<Calculator />)

    await pressDigits(user, '4')
    expect(screen.getByTestId('display')).toHaveTextContent('4')

    await user.click(screen.getByRole('button', { name: '+' }))
    // confirming the operator keeps the confirmed number on screen
    expect(screen.getByTestId('display')).toHaveTextContent('4')

    await pressDigits(user, '5')
    expect(screen.getByTestId('display')).toHaveTextContent('5')

    await user.click(screen.getByRole('button', { name: '=' }))

    await waitFor(() => expect(screen.getByTestId('display')).toHaveTextContent('9'))
    expect(client.calculate).toHaveBeenCalledWith('add', [4, 5])
  })

  it('treats memory as starting at 0 when an operator is pressed before typing anything', async () => {
    vi.spyOn(client, 'calculate').mockResolvedValue({ operation: 'add', operands: [0, 7], result: 7 })
    const user = userEvent.setup()
    render(<Calculator />)

    await user.click(screen.getByRole('button', { name: '+' }))
    await pressDigits(user, '7')
    await user.click(screen.getByRole('button', { name: '=' }))

    await waitFor(() => expect(client.calculate).toHaveBeenCalledWith('add', [0, 7]))
  })

  it('chains operations, using the previous result as the next memory value', async () => {
    const spy = vi.spyOn(client, 'calculate')
    spy.mockResolvedValueOnce({ operation: 'add', operands: [4, 5], result: 9 })
    spy.mockResolvedValueOnce({ operation: 'multiply', operands: [9, 2], result: 18 })
    const user = userEvent.setup()
    render(<Calculator />)

    await pressDigits(user, '4')
    await user.click(screen.getByRole('button', { name: '+' }))
    await pressDigits(user, '5')
    // pressing another operator instead of "=" should confirm 4+5 first
    await user.click(screen.getByRole('button', { name: '×' }))
    await waitFor(() => expect(screen.getByTestId('display')).toHaveTextContent('9'))

    await pressDigits(user, '2')
    await user.click(screen.getByRole('button', { name: '=' }))

    await waitFor(() => expect(screen.getByTestId('display')).toHaveTextContent('18'))
    expect(spy).toHaveBeenNthCalledWith(1, 'add', [4, 5])
    expect(spy).toHaveBeenNthCalledWith(2, 'multiply', [9, 2])
  })

  it('re-selects the pending operator without recomputing if no new digits were typed', async () => {
    const spy = vi.spyOn(client, 'calculate')
    const user = userEvent.setup()
    render(<Calculator />)

    await pressDigits(user, '4')
    await user.click(screen.getByRole('button', { name: '+' }))
    await user.click(screen.getByRole('button', { name: '×' }))

    expect(screen.getByRole('button', { name: '×' })).toHaveAttribute('aria-pressed', 'true')
    expect(spy).not.toHaveBeenCalled()
  })

  it('computes sqrt immediately on the current display without a second operand', async () => {
    vi.spyOn(client, 'calculate').mockResolvedValue({ operation: 'sqrt', operands: [9], result: 3 })
    const user = userEvent.setup()
    render(<Calculator />)

    await pressDigits(user, '9')
    await user.click(screen.getByRole('button', { name: '√' }))

    await waitFor(() => expect(screen.getByTestId('display')).toHaveTextContent('3'))
    expect(client.calculate).toHaveBeenCalledWith('sqrt', [9])
  })

  it('builds a decimal number and ignores a second decimal point', async () => {
    vi.spyOn(client, 'calculate').mockResolvedValue({ operation: 'add', operands: [3.5, 1], result: 4.5 })
    const user = userEvent.setup()
    render(<Calculator />)

    await pressDigits(user, '3')
    await user.click(screen.getByRole('button', { name: '.' }))
    await pressDigits(user, '5')
    await user.click(screen.getByRole('button', { name: '.' }))
    expect(screen.getByTestId('display')).toHaveTextContent('3.5')

    await user.click(screen.getByRole('button', { name: '+' }))
    await pressDigits(user, '1')
    await user.click(screen.getByRole('button', { name: '=' }))

    await waitFor(() => expect(client.calculate).toHaveBeenCalledWith('add', [3.5, 1]))
  })

  it('starts a fresh decimal number ("0.") when a decimal point is the first key pressed', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.click(screen.getByRole('button', { name: '.' }))

    expect(screen.getByTestId('display')).toHaveTextContent('0.')
  })

  it('applies sqrt to the in-flight second operand without disturbing the pending operation', async () => {
    const spy = vi.spyOn(client, 'calculate')
    spy.mockResolvedValueOnce({ operation: 'sqrt', operands: [9], result: 3 })
    spy.mockResolvedValueOnce({ operation: 'add', operands: [5, 3], result: 8 })
    const user = userEvent.setup()
    render(<Calculator />)

    await pressDigits(user, '5')
    await user.click(screen.getByRole('button', { name: '+' }))
    await pressDigits(user, '9')
    await user.click(screen.getByRole('button', { name: '√' }))
    await waitFor(() => expect(screen.getByTestId('display')).toHaveTextContent('3'))

    await user.click(screen.getByRole('button', { name: '=' }))

    await waitFor(() => expect(screen.getByTestId('display')).toHaveTextContent('8'))
    expect(spy).toHaveBeenNthCalledWith(1, 'sqrt', [9])
    expect(spy).toHaveBeenNthCalledWith(2, 'add', [5, 3])
  })

  it('resets the pending operator when a chained calculation fails', async () => {
    vi.spyOn(client, 'calculate').mockRejectedValue(
      new client.ApiError({ code: 'DIVISION_BY_ZERO', message: 'cannot divide by zero' }),
    )
    const user = userEvent.setup()
    render(<Calculator />)

    await pressDigits(user, '4')
    await user.click(screen.getByRole('button', { name: '÷' }))
    await pressDigits(user, '0')
    await user.click(screen.getByRole('button', { name: '×' }))

    await screen.findByRole('alert')
    expect(screen.getByRole('button', { name: '=' })).toBeDisabled()
  })

  it('renders a generic message for a non-API, non-network failure', async () => {
    vi.spyOn(client, 'calculate').mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    render(<Calculator />)

    await pressDigits(user, '4')
    await user.click(screen.getByRole('button', { name: '+' }))
    await pressDigits(user, '5')
    await user.click(screen.getByRole('button', { name: '=' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i)
  })

  it('renders the backend error message when the API rejects the request', async () => {
    vi.spyOn(client, 'calculate').mockRejectedValue(
      new client.ApiError({ code: 'DIVISION_BY_ZERO', message: 'cannot divide by zero' }),
    )
    const user = userEvent.setup()
    render(<Calculator />)

    await pressDigits(user, '4')
    await user.click(screen.getByRole('button', { name: '÷' }))
    await pressDigits(user, '0')
    await user.click(screen.getByRole('button', { name: '=' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('cannot divide by zero')
  })

  it('clears display, memory, and the pending operator on AC', async () => {
    vi.spyOn(client, 'calculate').mockResolvedValue({ operation: 'add', operands: [4, 5], result: 9 })
    const user = userEvent.setup()
    render(<Calculator />)

    await pressDigits(user, '4')
    await user.click(screen.getByRole('button', { name: '+' }))
    await pressDigits(user, '5')
    await user.click(screen.getByRole('button', { name: '=' }))
    await waitFor(() => expect(screen.getByTestId('display')).toHaveTextContent('9'))

    await user.click(screen.getByRole('button', { name: 'AC' }))

    expect(screen.getByTestId('display')).toHaveTextContent('0')
    expect(screen.getByRole('button', { name: '=' })).toBeDisabled()
  })
})
