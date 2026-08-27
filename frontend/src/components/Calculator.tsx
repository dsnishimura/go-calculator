import { useEffect, useState } from 'react'
import { calculate, ApiError, NetworkError } from '../api/calculatorClient'
import { OPERATION_LABELS, type Operation } from '../types/calculator'
import { CalculatorPad } from './CalculatorPad'
import { Display } from './Display'
import { ErrorMessage } from './ErrorMessage'

// sqrt is unary: it acts on the currently displayed value immediately,
// rather than confirming an operand and waiting for a second one.
const UNARY_OPERATIONS: ReadonlySet<Operation> = new Set(['sqrt'])

const KEYBOARD_OPERATORS: Record<string, Operation> = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide',
  '%': 'percentage',
  '^': 'power',
}

function formatResult(value: number): string {
  if (!Number.isFinite(value)) return String(value)
  // Trim floating-point noise (e.g. 0.1 + 0.2) without losing precision for
  // legitimately large/small results.
  return parseFloat(value.toPrecision(12)).toString()
}

export function Calculator() {
  // `memory` is the running accumulator (starts at 0); `display` is the
  // number currently being typed on the keypad. Pressing an operator
  // confirms `display` — either into memory (if nothing is pending yet) or
  // combined with memory via the pending operation — then arms the new
  // pending operation and waits for the next number.
  const [display, setDisplay] = useState('0')
  const [memory, setMemory] = useState(0)
  const [pendingOp, setPendingOp] = useState<Operation | null>(null)
  const [awaitingNewInput, setAwaitingNewInput] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function handleDigit(key: string) {
    setError(null)
    if (key === '.') {
      if (awaitingNewInput) {
        setDisplay('0.')
        setAwaitingNewInput(false)
        return
      }
      if (display.includes('.')) return
      setDisplay(display + '.')
      return
    }

    if (awaitingNewInput) {
      setDisplay(key)
      setAwaitingNewInput(false)
      return
    }
    setDisplay(display === '0' ? key : display + key)
  }

  async function runCalculation(operation: Operation, operands: number[]): Promise<number | null> {
    setIsLoading(true)
    setError(null)
    try {
      const response = await calculate(operation, operands)
      return response.result
    } catch (err) {
      if (err instanceof ApiError || err instanceof NetworkError) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }

  async function handleOperatorPress(operation: Operation) {
    const typedValue = parseFloat(display)

    if (UNARY_OPERATIONS.has(operation)) {
      const result = await runCalculation(operation, [typedValue])
      if (result === null) return
      setDisplay(formatResult(result))
      // Only fold into memory if there's no pending binary op — otherwise
      // this is a modifier applied to the in-flight second operand (e.g.
      // "5 + √9 ="), and memory must keep holding the first operand.
      if (pendingOp === null) setMemory(result)
      setAwaitingNewInput(true)
      return
    }

    if (pendingOp !== null && !awaitingNewInput) {
      const result = await runCalculation(pendingOp, [memory, typedValue])
      if (result === null) {
        setPendingOp(null)
        setAwaitingNewInput(true)
        return
      }
      setMemory(result)
      setDisplay(formatResult(result))
    } else {
      setMemory(typedValue)
    }

    setPendingOp(operation)
    setAwaitingNewInput(true)
  }

  async function handleEquals() {
    if (pendingOp === null) return
    const typedValue = parseFloat(display)
    const result = await runCalculation(pendingOp, [memory, typedValue])
    setPendingOp(null)
    setAwaitingNewInput(true)
    if (result === null) return
    setMemory(result)
    setDisplay(formatResult(result))
  }

  function handleToggleSign() {
    if (display === '0') return
    setError(null)
    setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display)
    setAwaitingNewInput(false)
  }

  function handleClear() {
    setDisplay('0')
    setMemory(0)
    setPendingOp(null)
    setAwaitingNewInput(true)
    setError(null)
  }

  // Physical-keyboard support: digits, ".", the four arithmetic symbols
  // plus "%" and "^", Enter/"=" for equals, Escape for AC.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return

      const { key } = event
      if (/^[0-9]$/.test(key) || key === '.') {
        handleDigit(key)
        return
      }
      if (key in KEYBOARD_OPERATORS) {
        event.preventDefault()
        handleOperatorPress(KEYBOARD_OPERATORS[key])
        return
      }
      if (key === 'Enter' || key === '=') {
        event.preventDefault()
        handleEquals()
        return
      }
      if (key === 'Escape') {
        handleClear()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display, memory, pendingOp, awaitingNewInput])

  const expression = pendingOp ? `${formatResult(memory)} ${OPERATION_LABELS[pendingOp]}` : undefined

  return (
    <div className="calculator">
      <Display value={display} expression={expression} />
      <ErrorMessage message={error} />
      <CalculatorPad
        pendingOperation={pendingOp}
        isLoading={isLoading}
        canEquals={pendingOp !== null}
        onDigit={handleDigit}
        onOperator={handleOperatorPress}
        onToggleSign={handleToggleSign}
        onEquals={handleEquals}
        onClear={handleClear}
      />
    </div>
  )
}
