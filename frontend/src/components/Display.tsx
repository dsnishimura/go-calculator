interface DisplayProps {
  value: string
}

export function Display({ value }: DisplayProps) {
  return (
    <div className="display" data-testid="display">
      {value}
    </div>
  )
}
