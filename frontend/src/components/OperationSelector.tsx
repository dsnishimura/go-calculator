import { OPERATIONS, OPERATION_LABELS, type Operation } from '../types/calculator'

interface OperationSelectorProps {
  pendingOperation: Operation | null
  onPress: (operation: Operation) => void
}

export function OperationSelector({ pendingOperation, onPress }: OperationSelectorProps) {
  return (
    <div className="operation-selector" role="group" aria-label="Operation">
      {OPERATIONS.map((operation) => (
        <button
          key={operation}
          type="button"
          className={`op-button${operation === pendingOperation ? ' op-button--selected' : ''}`}
          aria-pressed={operation === pendingOperation}
          onClick={() => onPress(operation)}
        >
          {OPERATION_LABELS[operation]}
        </button>
      ))}
    </div>
  )
}
