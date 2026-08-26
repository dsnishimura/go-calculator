import { useState } from 'react'
import { calculate, ApiError, NetworkError } from '../api/calculatorClient'
import { validateOperands } from '../utils/validation'
import type { Operation } from '../types/calculator'
import { Display } from './Display'
import { ErrorMessage } from './ErrorMessage'
import { OperandInputs } from './OperandInputs'
import { OperationSelector } from './OperationSelector'

function formatResult(value: number): string {
  if (!Number.isFinite(value)) return String(value)
  // Trim floating-point noise (e.g. 0.1 + 0.2) without losing precision for
  // legitimately large/small results.
  return parseFloat(value.toPrecision(12)).toString()
}

export function Calculator() {
  const [operation, setOperation] = useState<Operation>('add')
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function handleOperationChange(next: Operation) {
    setOperation(next)
    setError(null)
  }

  async function handleCalculate() {
    setError(null)

    const validation = validateOperands(operation, a, b)
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid input.')
      return
    }

    setIsLoading(true)
    try {
      const response = await calculate(operation, validation.operands)
      setResult(formatResult(response.result))
    } catch (err) {
      if (err instanceof ApiError || err instanceof NetworkError) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  function handleClear() {
    setA('')
    setB('')
    setResult(null)
    setError(null)
  }

  return (
    <div className="calculator">
      <Display value={result ?? (a || '0')} />
      <ErrorMessage message={error} />
      <OperandInputs operation={operation} a={a} b={b} onChangeA={setA} onChangeB={setB} />
      <OperationSelector value={operation} onChange={handleOperationChange} />
      <div className="action-row">
        <button type="button" className="action-button action-button--clear" onClick={handleClear}>
          AC
        </button>
        <button
          type="button"
          className="action-button action-button--equals"
          onClick={handleCalculate}
          disabled={isLoading}
        >
          {isLoading ? '…' : '='}
        </button>
      </div>
    </div>
  )
}
