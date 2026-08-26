import { describe, expect, it } from 'vitest'
import { validateOperands } from './validation'

describe('validateOperands', () => {
  it('accepts two valid numbers for a binary operation', () => {
    const result = validateOperands('add', '4', '5')
    expect(result).toEqual({ valid: true, operands: [4, 5] })
  })

  it('accepts one valid number for sqrt', () => {
    const result = validateOperands('sqrt', '9', '')
    expect(result).toEqual({ valid: true, operands: [9] })
  })

  it('ignores the second operand for sqrt even if invalid', () => {
    const result = validateOperands('sqrt', '9', 'not-a-number')
    expect(result.valid).toBe(true)
  })

  it('rejects an empty first operand', () => {
    const result = validateOperands('add', '', '5')
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/first number/i)
  })

  it('rejects a non-numeric second operand', () => {
    const result = validateOperands('add', '4', 'abc')
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/second number/i)
  })

  it('rejects Infinity and NaN-producing input', () => {
    expect(validateOperands('add', 'Infinity', '5').valid).toBe(false)
    expect(validateOperands('add', 'NaN', '5').valid).toBe(false)
  })

  it('does not flag divide by zero as a client-side error', () => {
    const result = validateOperands('divide', '4', '0')
    expect(result).toEqual({ valid: true, operands: [4, 0] })
  })

  it('accepts negative and decimal numbers', () => {
    expect(validateOperands('add', '-3.5', '2.25')).toEqual({ valid: true, operands: [-3.5, 2.25] })
  })
})
