import { COMPONENTS } from '../../../shared/components'
import { overallPercent, totalMB, useComponents } from '../lib/useComponents'
import { usePersistentState } from '../lib/usePersistentState'

/**
 * Aviso de la pantalla de inicio: ofrece descargar de una vez las piezas grandes (video, YouTube y quitar fondos)
 * para no tener que esperar cuando se necesiten. Se puede dejar para después.
 */
export default function ComponentsBanner(): React.JSX.Element | null {
  const c = useComponents()
  const [later, setLater] = usePersistentState('components-banner-later', false)

  const missing = c.installed ? COMPONENTS.filter((d) => !c.installed?.[d.id]).map((d) => d.id) : []
  // Si en esta sesión se bajó algo y ya no falta nada, se avisa que quedó listo
  const finished = Object.values(c.progress).some((p) => p?.state === 'done')

  if (!c.installed) return null
  if (finished && missing.length === 0)
    return <p className="notice components-banner">✅ ¡Listo! Ya está todo descargado.</p>
  if (missing.length === 0 || (later && !c.busy)) return null

  // Cuentan también las que se acaban de bajar, para que la barra nunca retroceda
  const involved = COMPONENTS.filter((d) => missing.includes(d.id) || c.progress[d.id]).map(
    (d) => d.id
  )
  const average = overallPercent(c, involved)
  const error = missing.map((id) => c.progress[id]).find((p) => p?.state === 'error')

  return (
    <section className="components-banner panel" aria-live="polite">
      <div>
        <b>⬇️ Falta descargar unas piezas ({totalMB(missing)} MB)</b>
        <p className="muted">
          Sirven para recortar y unir videos, bajar de YouTube y quitar fondos. Se descargan una
          sola vez y necesitas internet. El resto de la app funciona sin ellas.
        </p>
        {c.busy && (
          <>
            <div className="gate-bar" role="progressbar" aria-valuenow={average}>
              <span style={{ width: `${average}%` }} />
            </div>
            <p className="muted">Descargando… {average} %</p>
          </>
        )}
        {!c.busy && error?.message && <p className="notice error">{error.message}</p>}
      </div>
      <div className="row start">
        {c.busy ? (
          <button className="btn secondary small" onClick={() => c.cancel(missing)}>
            Cancelar
          </button>
        ) : (
          <>
            <button className="btn" onClick={() => void c.install(missing)}>
              {error ? 'Reintentar' : 'Descargar ahora'}
            </button>
            <button className="btn secondary small" onClick={() => setLater(true)}>
              Más tarde
            </button>
          </>
        )}
      </div>
    </section>
  )
}
