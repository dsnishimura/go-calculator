interface DisplayProps {
  value: string
  /** The confirmed operand and operator, e.g. "5 +", shown while a second number is expected. */
  expression?: string
}

export function Display({ value, expression }: DisplayProps) {
  return (
    <div className="display-area">
      <div className="display-expression" data-testid="display-expression">
        {expression || ' '}
      </div>
      <div className="display" data-testid="display">
        {value}
      </div>
    </div>
  )
}
