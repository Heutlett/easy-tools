import { useMemo, useState } from 'react'
import './style.css'
import '../_lengua/lengua.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import { gradeLabel } from '../../content/subjects'
import { GRADES, type Grade } from '../../content/types'
import type { Player } from '../../lib/games/players'
import { usePersistentState } from '../../lib/usePersistentState'
import { readingTexts } from './data'
import Session from './Session'
import { TEXT_KINDS, type TextKind } from './types'

type Phase =
  | { name: 'pick' }
  | { name: 'players'; first: string | null }
  | { name: 'play'; first: string | null; players: Player[] }

const wordCount = (paragraphs: string[]): number => paragraphs.join(' ').split(/\s+/).length

export default function Comprension(): React.JSX.Element {
  const [grade, setGrade] = usePersistentState<Grade>('game:comprension:grade', 3)
  const [kind, setKind] = useState<TextKind | null>(null)
  const [phase, setPhase] = useState<Phase>({ name: 'pick' })

  const ofGrade = useMemo(() => readingTexts.filter((t) => t.grade === grade), [grade])
  const kinds = TEXT_KINDS.filter((k) => ofGrade.some((t) => t.kind === k.id))
  const shown = ofGrade.filter((t) => !kind || t.kind === kind)

  if (phase.name === 'players')
    return (
      <PlayerSetup
        optional
        onStart={(players) => setPhase({ name: 'play', first: phase.first, players })}
      />
    )

  if (phase.name === 'play')
    return (
      <Session
        grade={grade}
        kind={kind}
        firstId={phase.first}
        players={phase.players}
        onExit={() => setPhase({ name: 'pick' })}
      />
    )

  return (
    <section className="panel cp-pick">
      <div className="row start">
        <span className="ln-field-title">Grado</span>
        <div className="pills" role="group" aria-label="Grado">
          {GRADES.map((g) => (
            <button
              key={g}
              className={`pill ${grade === g ? 'selected' : ''}`}
              aria-pressed={grade === g}
              onClick={() => (setGrade(g), setKind(null))}
            >
              {gradeLabel(g)}
            </button>
          ))}
        </div>
      </div>
      <div className="row start">
        <span className="ln-field-title">Tipo de texto</span>
        <div className="pills" role="group" aria-label="Tipo de texto">
          <button
            className={`pill ${kind === null ? 'selected' : ''}`}
            aria-pressed={kind === null}
            onClick={() => setKind(null)}
          >
            Todos
          </button>
          {kinds.map((k) => (
            <button
              key={k.id}
              className={`pill ${kind === k.id ? 'selected' : ''}`}
              aria-pressed={kind === k.id}
              onClick={() => setKind(kind === k.id ? null : k.id)}
            >
              {k.icon} {k.title}
            </button>
          ))}
        </div>
      </div>

      <div className="row start">
        <button
          className="btn big"
          disabled={shown.length === 0}
          onClick={() => setPhase({ name: 'players', first: null })}
        >
          🎲 Un texto al azar
        </button>
        <span className="muted">o elige uno:</span>
      </div>

      <div className="cp-list">
        {shown.map((t) => (
          <button
            key={t.id}
            className="list-card cp-item"
            onClick={() => setPhase({ name: 'players', first: t.id })}
          >
            <span className="cp-item-emoji" aria-hidden>
              {t.emoji}
            </span>
            <span className="cp-item-body">
              <strong>{t.title}</strong>
              <span className="muted">
                {TEXT_KINDS.find((k) => k.id === t.kind)?.title} · {wordCount(t.paragraphs)}{' '}
                palabras
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
