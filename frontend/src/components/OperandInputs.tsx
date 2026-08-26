import { OPERAND_ARITY, type Operation } from '../types/calculator'

interface OperandInputsProps {
  operation: Operation
  a: string
  b: string
  onChangeA: (value: string) => void
  onChangeB: (value: string) => void
}

export function OperandInputs({ operation, a, b, onChangeA, onChangeB }: OperandInputsProps) {
  const isUnary = OPERAND_ARITY[operation] === 1

  return (
    <div className="operand-inputs">
      <input
        type="text"
        inputMode="decimal"
        aria-label={isUnary ? 'Number' : 'First number'}
        placeholder="0"
        value={a}
        onChange={(e) => onChangeA(e.target.value)}
        className="operand-input"
      />
      {!isUnary && (
        <input
          type="text"
          inputMode="decimal"
          aria-label="Second number"
          placeholder="0"
          value={b}
          onChange={(e) => onChangeB(e.target.value)}
          className="operand-input"
        />
      )}
    </div>
  )
}
