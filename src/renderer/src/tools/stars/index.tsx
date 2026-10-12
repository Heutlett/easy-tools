import { usePersistentState } from '../../lib/usePersistentState'
import Points from './Points'
import Ranking from './Ranking'

type Tab = 'points' | 'ranking'

export default function PointsAndRanking(): React.JSX.Element {
  const [tab, setTab] = usePersistentState<Tab>('points-tab', 'points')

  return (
    <>
      <div className="pr-tabs" role="tablist" aria-label="Puntos o ranking">
        <button
          role="tab"
          aria-selected={tab === 'points'}
          className={`pr-tab points ${tab === 'points' ? 'on' : ''}`}
          onClick={() => setTab('points')}
        >
          <span className="pr-tab-icon" aria-hidden>
            ⭐
          </span>
          <span>
            <b>Puntos</b>
            <small>Los das tú, a mano</small>
          </span>
        </button>
        <button
          role="tab"
          aria-selected={tab === 'ranking'}
          className={`pr-tab ranking ${tab === 'ranking' ? 'on' : ''}`}
          onClick={() => setTab('ranking')}
        >
          <span className="pr-tab-icon" aria-hidden>
            🏆
          </span>
          <span>
            <b>Ranking de juegos</b>
            <small>Se llena solo al jugar</small>
          </span>
        </button>
      </div>

      {tab === 'points' ? (
        <div className="pr-pane points">
          <p className="pr-note points">
            ⭐ Estos puntos <b>los das tú</b>, cuando quieras. No se mezclan con el ranking de los
            juegos.
          </p>
          <Points />
        </div>
      ) : (
        <div className="pr-pane ranking">
          <p className="pr-note ranking">
            🏆 El ranking <b>se llena solo</b> cuando juegan en «Juegos» con estudiantes de tus
            grupos. No se mezcla con los puntos que das tú.
          </p>
          <Ranking />
        </div>
      )}
    </>
  )
}
