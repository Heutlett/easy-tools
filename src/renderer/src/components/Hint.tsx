import { usePersistentState } from '../lib/usePersistentState'

/** Las pistas que la persona ya cerró (se guardan los identificadores) */
export const HINTS_KEY = 'hints-closed'

/**
 * Pista discreta dentro de una pantalla: una línea con 💡 que dice algo útil justo donde sirve.
 * Se cierra con la ✕ y no vuelve a salir (en «Ayuda» se pueden volver a mostrar todas).
 */
export default function Hint({
  id,
  children
}: {
  id: string
  children: React.ReactNode
}): React.JSX.Element | null {
  const [closed, setClosed] = usePersistentState<string[]>(HINTS_KEY, [])
  if (closed.includes(id)) return null
  return (
    <p className="hint" role="note">
      <span aria-hidden>💡</span>
      <span className="hint-text">{children}</span>
      <button
        className="hint-close"
        aria-label="Cerrar esta pista"
        title="Cerrar esta pista"
        onClick={() => setClosed([...closed, id])}
      >
        ✕
      </button>
    </p>
  )
}
