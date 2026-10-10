import { useState } from 'react'
import './style.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import type { Player } from '../../lib/games/players'
import { usePersistentState } from '../../lib/usePersistentState'
import { ActivityCards, PillRow, type ActivityInfo } from '../_manip/Menu'
import Runner from '../_manip/Runner'
import { Compare, Equivalent, Identify, Paint, Sum } from './activities'
import { FR_LEVELS } from './data'

type ActivityId = 'colorea' | 'cual' | 'compara' | 'equivalentes' | 'suma'
interface Prefs {
  activity: ActivityId
  level: number
  total: number
}
const DEFAULTS: Prefs = { activity: 'colorea', level: 4, total: 8 }

const ACTIVITIES: ActivityInfo[] = [
  {
    id: 'colorea',
    icon: '🎨',
    title: 'Colorea la fracción',
    desc: 'Se pide ¾: colorea 3 de 4 partes'
  },
  {
    id: 'cual',
    icon: '🔍',
    title: '¿Qué fracción es?',
    desc: 'Mira la figura y elige la fracción'
  },
  { id: 'compara', icon: '⚖️', title: 'Compara', desc: 'Elige <, = o > entre dos fracciones' },
  {
    id: 'equivalentes',
    icon: '🟰',
    title: 'Equivalentes',
    desc: 'Colorea para que valga lo mismo',
    note: 'Se ve en 6.º'
  },
  {
    id: 'suma',
    icon: '➕',
    title: 'Suma visual',
    desc: 'Suma fracciones y colorea el resultado',
    note: 'Se ve en 6.º'
  }
]

type Phase = { name: 'menu' } | { name: 'players' } | { name: 'play'; players: Player[] }

export default function Fracciones(): React.JSX.Element {
  const [prefs, setPrefs] = usePersistentState<Prefs>('game:fracciones:prefs', DEFAULTS)
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
          p.activity === 'colorea' ? (
            <Paint ctx={ctx} level={p.level} />
          ) : p.activity === 'cual' ? (
            <Identify ctx={ctx} level={p.level} />
          ) : p.activity === 'compara' ? (
            <Compare ctx={ctx} level={p.level} />
          ) : p.activity === 'equivalentes' ? (
            <Equivalent ctx={ctx} level={p.level} />
          ) : (
            <Sum ctx={ctx} level={p.level} />
          )
        }
      />
    )

  return (
    <div className="g-stage mp-menu">
      <ActivityCards
        items={ACTIVITIES}
        value={p.activity}
        onChange={(a) => set({ activity: a as ActivityId })}
      />
      <PillRow
        label="Nivel"
        value={p.level}
        onChange={(l) => set({ level: l })}
        items={FR_LEVELS.map((l) => ({ id: l.id, label: `${l.grade} · ${l.title}` }))}
      />
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
      </div>
    </div>
  )
}
