import { OPERATION_LABELS, type Operation } from '../types/calculator'

interface CalculatorPadProps {
  pendingOperation: Operation | null
  isLoading: boolean
  canEquals: boolean
  onDigit: (key: string) => void
  onOperator: (operation: Operation) => void
  onToggleSign: () => void
  onEquals: () => void
  onClear: () => void
}

interface OpKeyProps {
  operation: Operation
  variant: 'sci' | 'op'
  pending: boolean
  onOperator: (operation: Operation) => void
}

function OpKey({ operation, variant, pending, onOperator }: OpKeyProps) {
  return (
    <button
      type="button"
      className={`key key--${variant}${pending ? ' key--selected' : ''}`}
      aria-pressed={pending}
      onClick={() => onOperator(operation)}
    >
      {OPERATION_LABELS[operation]}
    </button>
  )
}

/**
 * The full input surface: laid out like Apple's own scientific-mode
 * Calculator — a top row for AC, ± and the modifier/scientific keys (xʸ, √,
 * %), digits with the four chainable arithmetic operators in the right
 * column, and "=" as a closing full-width action. Digits and operators are
 * combined here (rather than split across components) because they form one
 * interaction surface: an operator press reads the current digit entry.
 */
export function CalculatorPad({
  pendingOperation,
  isLoading,
  canEquals,
  onDigit,
  onOperator,
  onToggleSign,
  onEquals,
  onClear,
}: CalculatorPadProps) {
  const isPending = (operation: Operation) => operation === pendingOperation

  return (
    <div className="pad">
      <div className="pad-row">
        <button type="button" className="key key--fn" onClick={onClear}>
          AC
        </button>
        <button type="button" className="key key--fn" onClick={onToggleSign}>
          ±
        </button>
        <OpKey operation="power" variant="sci" pending={isPending('power')} onOperator={onOperator} />
        <OpKey operation="sqrt" variant="sci" pending={isPending('sqrt')} onOperator={onOperator} />
        <OpKey operation="percentage" variant="sci" pending={isPending('percentage')} onOperator={onOperator} />
      </div>

      <div className="pad-row">
        {['7', '8', '9'].map((digit) => (
          <button key={digit} type="button" className="key key--digit" onClick={() => onDigit(digit)}>
            {digit}
          </button>
        ))}
        <OpKey operation="divide" variant="op" pending={isPending('divide')} onOperator={onOperator} />
      </div>

      <div className="pad-row">
        {['4', '5', '6'].map((digit) => (
          <button key={digit} type="button" className="key key--digit" onClick={() => onDigit(digit)}>
            {digit}
          </button>
        ))}
        <OpKey operation="multiply" variant="op" pending={isPending('multiply')} onOperator={onOperator} />
      </div>

      <div className="pad-row">
        {['1', '2', '3'].map((digit) => (
          <button key={digit} type="button" className="key key--digit" onClick={() => onDigit(digit)}>
            {digit}
          </button>
        ))}
        <OpKey operation="subtract" variant="op" pending={isPending('subtract')} onOperator={onOperator} />
      </div>

      <div className="pad-row">
        <button type="button" className="key key--digit key--wide" onClick={() => onDigit('0')}>
          0
        </button>
        <button type="button" className="key key--digit" onClick={() => onDigit('.')}>
          .
        </button>
        <OpKey operation="add" variant="op" pending={isPending('add')} onOperator={onOperator} />
      </div>

      <button type="button" className="key key--equals" onClick={onEquals} disabled={!canEquals || isLoading}>
        {isLoading ? '…' : '='}
      </button>
    </div>
  )
}
