import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Display } from './Display'

describe('Display', () => {
  it('renders the given value', () => {
    render(<Display value="42" />)
    expect(screen.getByTestId('display')).toHaveTextContent('42')
  })
})
