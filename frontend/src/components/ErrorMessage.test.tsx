import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorMessage } from './ErrorMessage'

describe('ErrorMessage', () => {
  it('renders nothing when there is no message', () => {
    const { container } = render(<ErrorMessage message={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the message with an alert role', () => {
    render(<ErrorMessage message="cannot divide by zero" />)
    expect(screen.getByRole('alert')).toHaveTextContent('cannot divide by zero')
  })
})
