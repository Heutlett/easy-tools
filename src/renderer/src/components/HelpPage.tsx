import { useEffect, useRef, useState } from 'react'
import { HELP, HELP_GROUPS, type HelpTopic } from '../help/topics'
import { matchesQuery } from '../lib/search'
import { usePersistentState } from '../lib/usePersistentState'
import { HINTS_KEY } from './Hint'
import { TIPS_OFF_KEY } from './TipCard'

interface Props {
  /** Pregunta que se abre al entrar (viene del consejo o del buscador) */
  openId?: string | null
  onBack: () => void
  onGo: (topic: HelpTopic) => void
}

/** Ayuda: lo que la persona quiere hacer, con pasos cortos y un botón que lleva ahí. Tiene buscador. */
export default function HelpPage({ openId, onBack, onGo }: Props): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<string | null>(openId ?? null)
  const [, setClosedHints] = usePersistentState<string[]>(HINTS_KEY, [])
  const [tipsOff, setTipsOff] = usePersistentState(TIPS_OFF_KEY, false)
  const [reset, setReset] = useState(false)
  const target = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    target.current?.scrollIntoView({ block: 'center' })
  }, [])

  const visible = HELP.filter((t) =>
    matchesQuery(query, t.question, ...t.steps, ...(t.keywords ?? []))
  )

  return (
    <main className="help-page">
      <header className="home-header">
        <div className="brand">
          <span className="tool-icon" aria-hidden>
            ❓
          </span>
          <div>
            <h1>Ayuda</h1>
            <p className="muted">¿Qué quieres hacer? Aquí te digo cómo, paso a paso.</p>
          </div>
        </div>
        <button className="btn secondary" onClick={onBack}>
          ← Volver al inicio
        </button>
      </header>

      <input
        className="field catalog-search"
        type="search"
        value={query}
        placeholder="🔍 Escribe lo que quieres hacer (por ejemplo «preguntas», «puntos»)…"
        aria-label="Buscar en la ayuda"
        onChange={(e) => setQuery(e.target.value)}
      />

      {HELP_GROUPS.map((g) => {
        const list = visible.filter((t) => t.group === g.id)
        if (list.length === 0) return null
        return (
          <section key={g.id} className="category">
            <h3 className="category-title">
              <span aria-hidden>{g.icon}</span> {g.title}
            </h3>
            <div className="help-list">
              {list.map((t) => (
                <details
                  key={t.id}
                  className="help-item"
                  ref={t.id === openId ? target : undefined}
                  open={open === t.id || query.trim() !== ''}
                  onToggle={(e) => {
                    const isOpen = (e.currentTarget as HTMLDetailsElement).open
                    if (isOpen) setOpen(t.id)
                    else if (open === t.id) setOpen(null)
                  }}
                >
                  <summary>
                    <span aria-hidden>{t.icon}</span> {t.question}
                  </summary>
                  <ol className="help-steps">
                    {t.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                  {t.target && (
                    <button className="btn small" onClick={() => onGo(t)}>
                      {t.target.label} →
                    </button>
                  )}
                </details>
              ))}
            </div>
          </section>
        )
      })}

      {visible.length === 0 && (
        <div className="notice catalog-empty">
          <p>No encontré ayuda para «{query.trim()}». Prueba con otra palabra.</p>
          <p className="muted">
            ¿Algo no se entiende o no lo encuentras? Escríbeme: tu duda ayuda a mejorar Educando.
            Mis datos de contacto están en «💜 Acerca de».
          </p>
          <button className="btn secondary small" onClick={() => setQuery('')}>
            Ver todo
          </button>
        </div>
      )}

      <section className="panel help-prefs">
        <p className="panel-title">Pistas y consejos</p>
        <p className="muted">
          En las pantallas hay pistas con 💡 y en el inicio un consejo. Si las cerraste, aquí las
          puedes volver a mostrar.
        </p>
        <div className="row start">
          <button className="btn secondary" onClick={() => (setClosedHints([]), setReset(true))}>
            💡 Volver a mostrar las pistas
          </button>
          {tipsOff && (
            <button className="btn secondary" onClick={() => setTipsOff(false)}>
              Mostrar el consejo del inicio
            </button>
          )}
        </div>
        {reset && <p className="muted">Listo: las pistas volverán a aparecer.</p>}
      </section>
    </main>
  )
}
