import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Display } from './Display'

describe('Display', () => {
  it('renders the given value', () => {
    render(<Display value="42" />)
    expect(screen.getByTestId('display')).toHaveTextContent('42')
  })

  it('renders the expression line when provided', () => {
    render(<Display value="3" expression="5 +" />)
    expect(screen.getByTestId('display-expression')).toHaveTextContent('5 +')
  })

  it('renders an empty expression line when none is provided', () => {
    render(<Display value="0" />)
    expect(screen.getByTestId('display-expression')).toHaveTextContent('')
  })
})
