import { useState } from 'react'
import './style.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import type { Player } from '../../lib/games/players'
import { usePersistentState } from '../../lib/usePersistentState'
import { ActivityCards, PillRow, type ActivityInfo } from '../_manip/Menu'
import Runner from '../_manip/Runner'
import { CountMoney, Exchange, FormAmount, Shopping } from './activities'
import { MONEY_LEVELS } from './data'

type ActivityId = 'forma' | 'cuenta' | 'compras' | 'cambio'
type Shop = 'pulperia' | 'feria' | 'mix'
interface Prefs {
  activity: ActivityId
  level: number
  shop: Shop
  many: boolean
  total: number
}
const DEFAULTS: Prefs = { activity: 'forma', level: 2, shop: 'mix', many: false, total: 8 }

const ACTIVITIES: ActivityInfo[] = [
  {
    id: 'forma',
    icon: '🪙',
    title: 'Forma el monto',
    desc: 'Toca monedas y billetes hasta juntar lo pedido'
  },
  {
    id: 'cuenta',
    icon: '🧮',
    title: 'Cuenta el dinero',
    desc: 'Mira el montón y elige cuánto hay'
  },
  {
    id: 'compras',
    icon: '🛒',
    title: 'La pulpería y la feria',
    desc: 'Compra, paga y arma el vuelto'
  },
  { id: 'cambio', icon: '🔁', title: 'Cambio', desc: '¿Cuántas monedas caben en un billete?' }
]

type Phase = { name: 'menu' } | { name: 'players' } | { name: 'play'; players: Player[] }

export default function Colones(): React.JSX.Element {
  const [prefs, setPrefs] = usePersistentState<Prefs>('game:colones:prefs', DEFAULTS)
  const p = { ...DEFAULTS, ...prefs }
  const [phase, setPhase] = useState<Phase>({ name: 'menu' })
  const set = (patch: Partial<Prefs>): void => setPrefs({ ...p, ...patch })
  if (phase.name === 'players')
    return (
      <div className="g-stage mp-menu">
        <button className="btn secondary small mp-back" onClick={() => setPhase({ name: 'menu' })}>
          ← Cambiar actividad
        </button>
        <PlayerSetup optional onStart={(players) => setPhase({ name: 'play', players })} />
      </div>
    )

  if (phase.name === 'play')
    return (
      <Runner
        players={phase.players}
        total={p.total}
        onExit={() => setPhase({ name: 'menu' })}
        renderQuestion={(ctx) =>
          p.activity === 'forma' ? (
            <FormAmount ctx={ctx} level={p.level} />
          ) : p.activity === 'cuenta' ? (
            <CountMoney ctx={ctx} level={p.level} />
          ) : p.activity === 'compras' ? (
            <Shopping ctx={ctx} shop={p.shop} many={p.many} />
          ) : (
            <Exchange ctx={ctx} level={p.level} />
          )
        }
        unit={p.activity === 'compras' ? 'compras' : 'aciertos'}
      />
    )

  return (
    <div className="g-stage mp-menu">
      <ActivityCards
        items={ACTIVITIES}
        value={p.activity}
        onChange={(a) => set({ activity: a as ActivityId })}
      />
      {p.activity === 'compras' ? (
        <>
          <PillRow
            label="Tienda"
            value={p.shop}
            onChange={(s) => set({ shop: s })}
            items={[
              { id: 'pulperia' as Shop, label: '🏪 Pulpería' },
              { id: 'feria' as Shop, label: '🥭 Feria' },
              { id: 'mix' as Shop, label: '🎲 Las dos' }
            ]}
          />
          <PillRow
            label="Compra"
            value={p.many ? 2 : 1}
            onChange={(n) => set({ many: n === 2 })}
            items={[
              { id: 1, label: 'Un artículo · 4.º' },
              { id: 2, label: 'Varios artículos · 5.º' }
            ]}
          />
        </>
      ) : (
        <PillRow
          label="Dinero"
          value={p.level}
          onChange={(l) => set({ level: l })}
          items={MONEY_LEVELS.map((l) => ({
            id: l.id,
            label: `${l.title} · ${l.grade}`
          }))}
        />
      )}
      <PillRow
        label="Preguntas"
        value={p.total}
        onChange={(total) => set({ total })}
        items={[5, 8, 12].map((n) => ({ id: n, label: String(n) }))}
      />
      <div className="row start">
        <button className="btn big" onClick={() => setPhase({ name: 'players' })}>
          Siguiente →
        </button>
        <span className="muted">
          Monedas de ₡10, ₡25, ₡50, ₡100 y ₡500; billetes de ₡1000 a ₡20 000
        </span>
      </div>
    </div>
  )
}
