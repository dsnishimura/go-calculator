export const OPERATIONS = [
  'add',
  'subtract',
  'multiply',
  'divide',
  'power',
  'sqrt',
  'percentage',
] as const

export type Operation = (typeof OPERATIONS)[number]

/** Number of operands each operation expects; sqrt is the only unary operation. */
export const OPERAND_ARITY: Record<Operation, 1 | 2> = {
  add: 2,
  subtract: 2,
  multiply: 2,
  divide: 2,
  power: 2,
  sqrt: 1,
  percentage: 2,
}

export const OPERATION_LABELS: Record<Operation, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
  power: 'xʸ',
  sqrt: '√',
  percentage: '%',
}

export interface CalculateResponse {
  operation: Operation
  operands: number[]
  result: number
}

export interface ApiErrorBody {
  code: string
  message: string
}
