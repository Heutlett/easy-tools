import { useState } from 'react'
import './style.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import type { Player } from '../../lib/games/players'
import { MAX_CATEGORIES, type Category, type Settings } from './board'
import Play from './Play'
import Setup from './Setup'

type Phase =
  | { name: 'players' }
  | { name: 'board'; players: Player[] }
  | {
      name: 'play'
      players: Player[]
      categories: Category[]
      settings: Settings
      /** Cambia con cada partida para empezar desde cero */
      round: number
    }

export default function Contest(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>({ name: 'players' })

  if (phase.name === 'players')
    return (
      <PlayerSetup
        min={2}
        max={MAX_CATEGORIES}
        startLabel="Siguiente →"
        onStart={(players) => setPhase({ name: 'board', players })}
      />
    )

  if (phase.name === 'board') {
    const { players } = phase
    return (
      <Setup
        onStart={(categories, settings) =>
          setPhase({ name: 'play', players, categories, settings, round: 0 })
        }
      />
    )
  }

  return (
    <Play
      key={phase.round}
      players={phase.players}
      categories={phase.categories}
      settings={phase.settings}
      onRestart={() => setPhase({ ...phase, round: phase.round + 1 })}
      onChangeBoard={() => setPhase({ name: 'board', players: phase.players })}
      onExit={() => setPhase({ name: 'players' })}
    />
  )
}
