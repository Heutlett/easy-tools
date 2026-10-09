import { useState } from 'react'
import { formatTime, parseTime } from '../lib/format'

interface Props {
  id: string
  value: number
  min: number
  max: number
  onChange: (seconds: number) => void
}

/** Campo para escribir un tiempo como 1:30 o 1:30.5. Se confirma al salir del campo o con Enter. */
export default function TimeField({ id, value, min, max, onChange }: Props): React.JSX.Element {
  // Mientras se escribe se muestra el borrador; si no, siempre el valor actual.
  const [draft, setDraft] = useState<string | null>(null)

  const commit = (): void => {
    const parsed = draft === null ? null : parseTime(draft)
    if (parsed !== null) onChange(Math.min(max, Math.max(min, parsed)))
    setDraft(null)
  }

  return (
    <input
      id={id}
      className="field"
      value={draft ?? formatTime(value, true)}
      inputMode="decimal"
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
    />
  )
}
