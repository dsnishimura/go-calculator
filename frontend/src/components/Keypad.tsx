const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.']

interface KeypadProps {
  onPress: (key: string) => void
}

export function Keypad({ onPress }: KeypadProps) {
  return (
    <div className="keypad" role="group" aria-label="Number entry">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className={`key-button${key === '0' ? ' key-button--wide' : ''}`}
          onClick={() => onPress(key)}
        >
          {key}
        </button>
      ))}
    </div>
  )
}
