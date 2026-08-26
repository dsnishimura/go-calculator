import { OPERATIONS, OPERATION_LABELS, type Operation } from '../types/calculator'

interface OperationSelectorProps {
  value: Operation
  onChange: (operation: Operation) => void
}

export function OperationSelector({ value, onChange }: OperationSelectorProps) {
  return (
    <div className="operation-selector" role="group" aria-label="Operation">
      {OPERATIONS.map((operation) => (
        <button
          key={operation}
          type="button"
          className={`op-button${operation === value ? ' op-button--selected' : ''}`}
          aria-pressed={operation === value}
          onClick={() => onChange(operation)}
        >
          {OPERATION_LABELS[operation]}
        </button>
      ))}
    </div>
  )
}
