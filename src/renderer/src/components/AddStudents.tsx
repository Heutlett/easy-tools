import { useState } from 'react'
import { parseNames } from '../lib/classrooms'

interface Props {
  onAdd: (names: string[]) => void
  /** Texto del botón */
  label?: string
}

/** Cuadro para agregar estudiantes: uno por línea, o una lista completa pegada desde Word o Excel. */
export default function AddStudents({ onAdd, label = 'Agregar' }: Props): React.JSX.Element {
  const [text, setText] = useState('')
  const names = parseNames(text)

  const add = (): void => {
    if (names.length === 0) return
    onAdd(names)
    setText('')
  }

  return (
    <div className="add-students">
      <textarea
        className="field"
        rows={3}
        value={text}
        spellCheck={false}
        placeholder="Escribe un nombre (o pega una lista, un nombre por línea) y presiona Enter"
        aria-label="Nombres de estudiantes"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          // Enter agrega; Shift + Enter hace un renglón nuevo
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            add()
          }
        }}
      />
      <button className="btn" disabled={names.length === 0} onClick={add}>
        {names.length > 1 ? `${label} ${names.length} estudiantes` : label}
      </button>
    </div>
  )
}
