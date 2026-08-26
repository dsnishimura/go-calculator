import { OPERAND_ARITY, type Operation } from '../types/calculator'

export interface ValidationResult {
  valid: boolean
  error?: string
  operands: number[]
}

/**
 * Fast-fail client-side validation: checks that the operands required for
 * the selected operation are present and are finite numbers. It deliberately
 * does not pre-check operation-specific math errors (divide by zero,
 * negative sqrt) — those are sent to the backend so its structured error
 * handling is exercised end-to-end.
 */
export function validateOperands(operation: Operation, rawA: string, rawB: string): ValidationResult {
  const arity = OPERAND_ARITY[operation]

  const a = parseOperand(rawA)
  if (a === undefined) {
    return { valid: false, error: 'Enter a valid first number.', operands: [] }
  }
  if (arity === 1) {
    return { valid: true, operands: [a] }
  }

  const b = parseOperand(rawB)
  if (b === undefined) {
    return { valid: false, error: 'Enter a valid second number.', operands: [] }
  }
  return { valid: true, operands: [a, b] }
}

function parseOperand(raw: string): number | undefined {
  if (raw.trim() === '') return undefined
  const value = Number(raw)
  return Number.isFinite(value) ? value : undefined
}
