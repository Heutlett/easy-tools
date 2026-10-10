import { useMemo, useState } from 'react'
import './style.css'
import '../_lengua/lengua.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import { gradeLabel } from '../../content/subjects'
import { GRADES, type Grade } from '../../content/types'
import type { Player } from '../../lib/games/players'
import { pick, shuffle } from '../../lib/games/shuffle'
import { usePersistentState } from '../../lib/usePersistentState'
import Quiz, { type QuizItem } from './Quiz'
import Twisters from './Twisters'
import { makeRhymeItem } from './rhymes'
import { verses } from './verses'

type Activity = 'trabalenguas' | 'rima' | 'verso'

const ACTIVITIES: { id: Activity; icon: string; title: string; desc: string }[] = [
  { id: 'trabalenguas', icon: '👅', title: 'Trabalenguas', desc: 'Decirlos rápido y sin trabarse' },
  { id: 'rima', icon: '🎯', title: 'Busca la rima', desc: 'Una palabra y cuatro opciones' },
  {
    id: 'verso',
    icon: '✍️',
    title: 'Complete la rima',
    desc: 'Versos a los que les falta una palabra'
  }
]

const ROUNDS = 10

type Phase =
  { name: 'menu' } | { name: 'players' } | { name: 'play'; players: Player[]; round: number }

export default function Trabalenguas(): React.JSX.Element {
  const [activity, setActivity] = usePersistentState<Activity>(
    'game:trabalenguas:activity',
    'trabalenguas'
  )
  const [grade, setGrade] = usePersistentState<Grade | 0>('game:trabalenguas:grade', 0)
  const [phase, setPhase] = useState<Phase>({ name: 'menu' })

  if (phase.name === 'players')
    return (
      <PlayerSetup optional onStart={(players) => setPhase({ name: 'play', players, round: 0 })} />
    )

  if (phase.name === 'play')
    return (
      <Play
        key={`${activity}-${phase.round}`}
        activity={activity}
        grade={grade}
        players={phase.players}
        onAgain={() => setPhase({ ...phase, round: phase.round + 1 })}
        onExit={() => setPhase({ name: 'menu' })}
      />
    )

  return (
    <section className="panel tw-menu">
      <div className="ln-menu-cards" role="group" aria-label="Actividad">
        {ACTIVITIES.map((a) => (
          <button
            key={a.id}
            className={`ln-card ${activity === a.id ? 'selected' : ''}`}
            aria-pressed={activity === a.id}
            onClick={() => setActivity(a.id)}
          >
            <span className="ln-card-icon">{a.icon}</span>
            <span className="ln-card-title">{a.title}</span>
            <span className="ln-card-desc">{a.desc}</span>
          </button>
        ))}
      </div>
      <div className="row start">
        <span className="ln-field-title">Grado</span>
        <div className="pills" role="group" aria-label="Grado">
          <button
            className={`pill ${grade === 0 ? 'selected' : ''}`}
            aria-pressed={grade === 0}
            onClick={() => setGrade(0)}
          >
            Todos
          </button>
          {GRADES.map((g) => (
            <button
              key={g}
              className={`pill ${grade === g ? 'selected' : ''}`}
              aria-pressed={grade === g}
              onClick={() => setGrade(g)}
            >
              {gradeLabel(g)}
            </button>
          ))}
        </div>
      </div>
      <div className="row start">
        <button className="btn big" onClick={() => setPhase({ name: 'players' })}>
          Siguiente →
        </button>
      </div>
    </section>
  )
}

function Play({
  activity,
  grade,
  players,
  onAgain,
  onExit
}: {
  activity: Activity
  grade: Grade | 0
  players: Player[]
  onAgain: () => void
  onExit: () => void
}): React.JSX.Element {
  const items = useMemo(
    () => (activity === 'rima' ? rhymeItems(grade) : activity === 'verso' ? verseItems(grade) : []),
    [activity, grade]
  )
  if (activity === 'trabalenguas')
    return <Twisters grade={grade} players={players} onExit={onExit} />
  return (
    <Quiz
      items={items}
      players={players}
      onAgain={onAgain}
      onExit={onExit}
      exitLabel="Cambiar de actividad"
    />
  )
}

/** Las palabras de «Busca la rima»: sin repetir la palabra de arriba */
function rhymeItems(grade: Grade | 0): QuizItem[] {
  const g = (grade || 6) as Grade
  const used: string[] = []
  return Array.from({ length: ROUNDS }, () => {
    const r = makeRhymeItem(g, used)
    used.push(r.word)
    return {
      prompt: (
        <>
          <span className="tw-small">¿Cuál rima con…</span>
          <span className="tw-word">{r.word}</span>
        </>
      ),
      badge: r.kind === 'consonante' ? 'Rima consonante' : 'Rima asonante',
      options: r.options,
      answer: r.answer,
      note: r.note,
      speak: r.word
    }
  })
}

function verseItems(grade: Grade | 0): QuizItem[] {
  const pool = verses.filter((v) => grade === 0 || (v.grade <= grade && v.grade >= grade - 1))
  const chosen = pick(pool.length >= 4 ? pool : verses, ROUNDS)
  return chosen.map((v) => {
    const options = shuffle(v.options)
    const correct = v.options[0]
    const filled = v.lines.map((l) => l.replace('___', correct)).join('. ')
    return {
      prompt: (
        <span className={`tw-verse ${v.lines.length >= 4 ? 'tw-long' : ''}`}>
          {v.lines.map((line, i) => (
            <span key={i} className="tw-line">
              {line.split('___').flatMap((part, j, all) =>
                j < all.length - 1
                  ? [
                      part,
                      <span key={j} className="tw-blank">
                        &nbsp;
                      </span>
                    ]
                  : [part]
              )}
            </span>
          ))}
        </span>
      ),
      badge: v.kind === 'consonante' ? 'Rima consonante' : 'Rima asonante',
      options,
      answer: options.indexOf(correct),
      note:
        v.kind === 'consonante'
          ? `«${correct}» rima con «${v.partner}»: terminan igual.`
          : `«${correct}» rima con «${v.partner}»: coinciden las vocales.`,
      speakAfter: filled
    }
  })
}
