import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Calculator } from './Calculator'
import * as client from '../api/calculatorClient'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Calculator', () => {
  it('enters operands, picks an operation, submits, and renders the result', async () => {
    vi.spyOn(client, 'calculate').mockResolvedValue({ operation: 'add', operands: [4, 5], result: 9 })
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText('First number'), '4')
    await user.type(screen.getByLabelText('Second number'), '5')
    await user.click(screen.getByRole('button', { name: '+' }))
    await user.click(screen.getByRole('button', { name: '=' }))

    await waitFor(() => expect(screen.getByTestId('display')).toHaveTextContent('9'))
    expect(client.calculate).toHaveBeenCalledWith('add', [4, 5])
  })

  it('shows a client-side validation error without calling the API', async () => {
    const spy = vi.spyOn(client, 'calculate')
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText('First number'), '4')
    // second number left empty
    await user.click(screen.getByRole('button', { name: '=' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/second number/i)
    expect(spy).not.toHaveBeenCalled()
  })

  it('renders the backend error message when the API rejects the request', async () => {
    vi.spyOn(client, 'calculate').mockRejectedValue(
      new client.ApiError({ code: 'DIVISION_BY_ZERO', message: 'cannot divide by zero' }),
    )
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText('First number'), '4')
    await user.type(screen.getByLabelText('Second number'), '0')
    await user.click(screen.getByRole('button', { name: '÷' }))
    await user.click(screen.getByRole('button', { name: '=' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('cannot divide by zero')
  })

  it('clears operands, result, and error on AC', async () => {
    vi.spyOn(client, 'calculate').mockResolvedValue({ operation: 'add', operands: [4, 5], result: 9 })
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText('First number'), '4')
    await user.type(screen.getByLabelText('Second number'), '5')
    await user.click(screen.getByRole('button', { name: '=' }))
    await waitFor(() => expect(screen.getByTestId('display')).toHaveTextContent('9'))

    await user.click(screen.getByRole('button', { name: 'AC' }))

    expect(screen.getByLabelText('First number')).toHaveValue('')
    expect(screen.getByTestId('display')).toHaveTextContent('0')
  })
})
