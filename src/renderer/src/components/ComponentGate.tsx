import { COMPONENTS, type ComponentId } from '../../../shared/components'
import { overallPercent, totalMB, useComponents } from '../lib/useComponents'

interface Props {
  /** Piezas que necesita lo que hay dentro */
  need?: ComponentId[]
  children: React.ReactNode
}

/**
 * Si la herramienta necesita una pieza grande que todavía no se ha descargado, en lugar de la herramienta
 * se muestra esta tarjeta con el botón para bajarla. Una vez descargada, aparece la herramienta.
 */
export default function ComponentGate({ need, children }: Props): React.JSX.Element {
  const c = useComponents()
  if (!need || need.length === 0) return <>{children}</>
  if (!c.installed) return <p className="muted">Cargando…</p>

  const missing = need.filter((id) => !c.installed?.[id])
  if (missing.length === 0) return <>{children}</>

  const defs = COMPONENTS.filter((d) => missing.includes(d.id))
  const failed = defs.map((d) => c.progress[d.id]).find((p) => p?.state === 'error')
  // Cuentan también las que se acaban de bajar, para que la barra nunca retroceda
  const involved = need.filter((id) => missing.includes(id) || c.progress[id])
  const average = overallPercent(c, involved)

  return (
    <section className="panel gate" aria-live="polite">
      <p className="gate-icon" aria-hidden>
        ⬇️
      </p>
      <h2 className="gate-title">Falta descargar una pieza</h2>
      <p>
        Para esto se necesita <b>{defs.map((d) => d.label.toLowerCase()).join(' y ')}</b> (unos{' '}
        {totalMB(missing)} MB). Se baja <b>una sola vez</b> y necesitas internet.
      </p>
      {c.busy ? (
        <>
          <div
            className="gate-bar"
            role="progressbar"
            aria-valuenow={average}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${average}%` }} />
          </div>
          <p className="muted">Descargando… {average} %</p>
          <button className="btn secondary" onClick={() => c.cancel(missing)}>
            Cancelar
          </button>
        </>
      ) : (
        <>
          {failed?.message && <p className="notice error">{failed.message}</p>}
          <button className="btn big" onClick={() => void c.install(missing)}>
            {failed ? 'Reintentar' : `Descargar (${totalMB(missing)} MB)`}
          </button>
        </>
      )}
    </section>
  )
}
