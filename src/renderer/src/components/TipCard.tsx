import { useEffect, useMemo, useState } from 'react'
import { HELP, type HelpTopic } from '../help/topics'
import { usePersistentState } from '../lib/usePersistentState'

export const TIPS_OFF_KEY = 'tips-off'
const SEEN_KEY = 'tips-seen'

/**
 * «¿Sabías que…?»: un consejo a la vez en el inicio, discreto. Salen primero los de cosas que todavía no se han usado.
 * Se oculta con la ✕ (en «Ayuda» se vuelve a activar).
 */
export default function TipCard({
  onHelp
}: {
  onHelp: (topicId: string) => void
}): React.JSX.Element | null {
  const [off, setOff] = usePersistentState(TIPS_OFF_KEY, false)
  const [seen, setSeen] = usePersistentState<string[]>(SEEN_KEY, [])
  // Se arma una sola vez al abrir: lo ya usado queda al final
  const order = useMemo<HelpTopic[]>(() => {
    const tips = HELP.filter((t) => t.tip)
    return [...tips.filter((t) => !t.done?.()), ...tips.filter((t) => t.done?.())]
  }, [])
  const [id, setId] = useState<string | null>(null)

  // El primer consejo que todavía no se mostró (si ya se vieron todos, se empieza de nuevo)
  const next = (after?: string): string | null => {
    const fresh = order.filter((t) => !seen.includes(t.id) && t.id !== after)
    if (fresh.length) return fresh[0].id
    const at = order.findIndex((t) => t.id === after)
    return order.length ? order[(at + 1) % order.length].id : null
  }
  const shown = id ?? next()
  const tip = order.find((t) => t.id === shown)

  useEffect(() => {
    if (tip && !off && !seen.includes(tip.id)) setSeen([...seen, tip.id])
  }, [tip, off, seen, setSeen])

  if (off || !tip) return null
  return (
    <aside className="tip-card" aria-label="Consejo">
      <span className="tip-icon" aria-hidden>
        💡
      </span>
      <p className="tip-text">
        <b>¿Sabías que…?</b> {tip.tip}
      </p>
      <div className="tip-actions">
        <button className="btn secondary small" onClick={() => onHelp(tip.id)}>
          Ver cómo
        </button>
        <button className="btn secondary small" onClick={() => setId(next(tip.id))}>
          Otro consejo
        </button>
        <button
          className="hint-close"
          aria-label="Ocultar los consejos"
          title="Ocultar los consejos"
          onClick={() => setOff(true)}
        >
          ✕
        </button>
      </div>
    </aside>
  )
}
