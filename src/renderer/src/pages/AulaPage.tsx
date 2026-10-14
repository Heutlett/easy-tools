import { Suspense } from 'react'
import { useNav, type AulaTab } from '../lib/nav'
import { tools } from '../tools/registry'

const TABS: { id: AulaTab; label: string; tool: string }[] = [
  { id: 'timer', label: '⏱️ Temporizador', tool: 'timer' },
  { id: 'wheel', label: '🎡 Ruleta', tool: 'wheel' },
  { id: 'number', label: '🎲 Número al azar', tool: 'random-number' }
]

/** En el aula: temporizador, ruleta y número al azar en pestañas, con «Proyectar» para verlos grandes. */
export default function AulaPage(): React.JSX.Element {
  const { place, patch } = useNav()
  const projecting = place.projecting
  const tab = TABS.find((t) => t.id === place.aulaTab) ?? TABS[0]
  const tool = tools.find((t) => t.id === tab.tool)

  return (
    <div
      className={`page aula-page ${projecting ? 'projecting' : ''}`}
      style={{ '--accent': tool?.color } as React.CSSProperties}
    >
      <header className="aula-head">
        {!projecting && <h1>En el aula</h1>}
        <div className="tabs-pill" role="tablist" aria-label="Herramientas del aula">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === tab.id}
              className={t.id === tab.id ? 'on' : ''}
              onClick={() => patch({ aulaTab: t.id })}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          className={`btn small project-btn ${projecting ? 'on' : 'secondary'}`}
          onClick={() => patch({ projecting: !projecting })}
        >
          {projecting ? '✕ Salir de proyección' : '📺 Proyectar'}
        </button>
      </header>
      <div className="aula-body">
        <Suspense fallback={<p className="muted">Cargando…</p>}>
          {tool && <tool.Component key={tool.id} />}
        </Suspense>
      </div>
    </div>
  )
}
