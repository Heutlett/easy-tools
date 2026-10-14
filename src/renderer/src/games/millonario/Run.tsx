import { useEffect, useRef, useState } from 'react'
import { gradeLabel, subjectOf } from '../../content/subjects'
import type { Question } from '../../content/types'
import { useCountdown } from '../../lib/games/useCountdown'
import { playTones, sfx } from '../../lib/games/sfx'
import { pickOne, shuffle, shuffleOptions } from '../../lib/games/shuffle'
import type { Player } from '../../lib/games/players'
import { CONSOLATION, CONSULT_SECONDS, PRAISE, SUSPENSE_MS, type LadderSpec } from './data'
import { useMood, type MusicControls } from './music'
import { colones, safeFloor, simulateAudience, wonSoFar, type TurnResult } from './logic'

const LETTERS = ['A', 'B', 'C', 'D']

interface View {
  options: string[]
  answer: number
}

type Phase = 'asking' | 'suspense' | 'revealed'

interface Props {
  ladder: Question[]
  spec: LadderSpec
  player?: Player
  music: MusicControls
  onFinish: (result: Omit<TurnResult, 'playerId'>) => void
  onExit: () => void
}

/** Latidos graves mientras se espera la respuesta */
function suspenseSound(): void {
  playTones(
    [0, 0.55, 1.1, 1.65].flatMap((at) => [
      { freq: 110, at, length: 0.18, type: 'triangle' as const, volume: 0.3 },
      { freq: 98, at: at + 0.2, length: 0.2, type: 'triangle' as const, volume: 0.22 }
    ])
  )
}

/** Un concursante contestando su escalera, de la pregunta 1 a la última (o hasta perder / retirarse) */
export default function Run({
  ladder,
  spec,
  player,
  music,
  onFinish,
  onExit
}: Props): React.JSX.Element {
  const [level, setLevel] = useState(0)
  const [view, setView] = useState<View>(() => shuffleOptions(ladder[0]))
  const [phase, setPhase] = useState<Phase>('asking')
  const [picked, setPicked] = useState<number | null>(null)
  const [removed, setRemoved] = useState<number[]>([])
  const [used, setUsed] = useState({ fifty: false, consult: false, crowd: false })
  const [votes, setVotes] = useState<number[] | null>(null)
  const [consultOpen, setConsultOpen] = useState(false)
  const [confirm, setConfirm] = useState<'walk' | 'exit' | null>(null)
  const [phrase, setPhrase] = useState('')
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const nextRef = useRef<HTMLButtonElement | null>(null)
  const consult = useCountdown({ ticks: true })

  const question = ladder[level]
  // La música cambia con el momento: se piensa la respuesta, se espera el resultado, y al revelar sonidos propios
  useMood(phase === 'asking' ? 'question' : phase === 'suspense' ? 'suspense' : 'off')
  const last = level === ladder.length - 1
  const correct = picked === view.answer
  const isTeam = player?.id.startsWith('team-') ?? false
  const sum = (n: number): string => colones(n)

  const lock = (): void => {
    if (phase !== 'asking' || picked === null) return
    consult.stop()
    setConsultOpen(false)
    setPhase('suspense')
    suspenseSound()
  }

  const choose = (i: number): void => {
    if (phase !== 'asking' || removed.includes(i)) return
    if (picked === i) return lock()
    setPicked(i)
    sfx.pop()
  }

  // Suspenso: tras una pausa se revela si acertó
  useEffect(() => {
    if (phase !== 'suspense') return
    const id = setTimeout(() => {
      const ok = picked === view.answer
      setPhase('revealed')
      setPhrase(pickOne(ok ? PRAISE : CONSOLATION) ?? '')
      if (ok) {
        sfx.correct()
        if (spec.safe.includes(level)) {
          playTones(
            [1047, 1319, 1568].map((freq, i) => ({ freq, at: 0.45 + i * 0.12, length: 0.3 }))
          )
        }
      } else sfx.wrong()
    }, SUSPENSE_MS)
    return () => clearTimeout(id)
  }, [phase, picked, view.answer, level, spec.safe])

  // Al revelar, el foco pasa a «Seguir» para que Enter lo active sin sorpresas
  useEffect(() => {
    if (phase === 'revealed') nextRef.current?.focus()
  }, [phase])

  const next = (): void => {
    if (phase !== 'revealed') return
    if (!correct) {
      onFinish({
        outcome: 'lost',
        amount: safeFloor(spec, level),
        answered: level,
        lostAt: level + 1
      })
    } else if (last) {
      onFinish({ outcome: 'won', amount: spec.prizes[level], answered: ladder.length })
    } else {
      const n = level + 1
      setLevel(n)
      setView(shuffleOptions(ladder[n]))
      setPicked(null)
      setRemoved([])
      setVotes(null)
      setPhase('asking')
    }
  }

  const fifty = (): void => {
    if (used.fifty || phase !== 'asking') return
    const wrong = [0, 1, 2, 3].filter((i) => i !== view.answer)
    // Se quitan dos incorrectas al azar; si ya había elegido una que se quita, se le deselecciona
    const drop = shuffle(wrong).slice(0, 2)
    setRemoved(drop)
    if (picked !== null && drop.includes(picked)) setPicked(null)
    setUsed({ ...used, fifty: true })
    if (votes) setVotes(null)
    sfx.pop()
  }

  const startConsult = (): void => {
    if (used.consult || phase !== 'asking') return
    setUsed({ ...used, consult: true })
    setConsultOpen(true)
    consult.start(CONSULT_SECONDS)
    sfx.pop()
  }

  const askCrowd = (): void => {
    if (used.crowd || phase !== 'asking') return
    const visible = [0, 1, 2, 3].filter((i) => !removed.includes(i))
    setVotes(simulateAudience(question.difficulty, view.answer, visible))
    setUsed({ ...used, crowd: true })
    sfx.correct()
  }

  const walk = (): void => {
    consult.stop()
    onFinish({ outcome: 'walked', amount: wonSoFar(spec, level), answered: level })
  }

  // Teclado: A-D eligen, Enter confirma o sigue (sin pisar a un botón enfocado, que Enter activa por sí solo)
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (confirm || e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target
      const tag = t instanceof HTMLElement ? t.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      const native = tag === 'BUTTON' && !(t as HTMLButtonElement).disabled
      const idx = e.key.length === 1 ? 'abcd'.indexOf(e.key.toLowerCase()) : -1
      if (idx >= 0) {
        e.preventDefault()
        if (phase !== 'asking' || removed.includes(idx)) return
        if (picked === idx) lock()
        else {
          choose(idx)
          optionRefs.current[idx]?.focus()
        }
      } else if (e.key === 'Enter' && !native) {
        e.preventDefault()
        if (phase === 'asking') lock()
        else if (phase === 'revealed') next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const subject = subjectOf(question.subject)
  const locked = phase !== 'asking'

  return (
    <div className="mi-tv mi-run">
      <div className="mi-main">
        <div className="mi-top">
          <div className="mi-badges">
            <button className="mi-mini" onClick={() => setConfirm('exit')}>
              ✕ Salir
            </button>
            <span className="mi-badge">
              {subject.icon} {subject.title} · {gradeLabel(question.grade)}
            </span>
            {player && (
              <span className="mi-badge mi-who">
                {player.emoji} Turno de {player.name}
              </span>
            )}
          </div>
          {consultOpen && (
            <div className={`mi-timer ${consult.seconds <= 5 ? 'low' : ''}`} role="timer">
              <span>⏱ {consult.seconds > 0 ? consult.seconds : '¡Tiempo!'}</span>
              <button
                className="mi-mini"
                onClick={() => (consult.stop(), setConsultOpen(false))}
                aria-label="Cerrar la cuenta regresiva"
              >
                Listo
              </button>
            </div>
          )}
          <div className="mi-top-actions">
            <button
              className="mi-mini"
              aria-label={music.settings.on ? 'Quitar la música' : 'Poner la música'}
              title={music.settings.on ? 'Quitar la música' : 'Poner la música'}
              onClick={music.toggle}
            >
              {music.settings.on ? '🎵 Música' : '🔇 Sin música'}
            </button>
          </div>
        </div>

        <div className="mi-question">
          <span className="mi-qnum">
            Pregunta {level + 1} · {sum(spec.prizes[level])}
          </span>
          <p className="mi-qtext">{question.text}</p>
          {level === 0 && phase === 'asking' && (
            <p className="mi-tip">
              👉 Toca una respuesta y luego «Respuesta final». Si dudan, usen un comodín.
            </p>
          )}
          {phase === 'revealed' && (
            <div className={`mi-verdict ${correct ? 'ok' : 'bad'}`} aria-live="polite">
              <p className="mi-verdict-title">
                {correct ? '✅' : '❌'} {phrase}
              </p>
              {question.explanation && <p className="mi-explain">{question.explanation}</p>}
            </div>
          )}
        </div>

        <div className="mi-options">
          {view.options.map((text, i) => {
            const gone = removed.includes(i)
            const cls = [
              'mi-opt',
              picked === i && phase === 'asking' && 'picked',
              picked === i && phase === 'suspense' && 'waiting',
              phase === 'revealed' && i === view.answer && 'correct',
              phase === 'revealed' && picked === i && i !== view.answer && 'wrong',
              phase === 'revealed' && i !== view.answer && picked !== i && 'dim'
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button
                key={i}
                ref={(el) => {
                  optionRefs.current[i] = el
                }}
                className={cls}
                style={{ visibility: gone ? 'hidden' : 'visible' }}
                disabled={locked}
                aria-label={`${LETTERS[i]}: ${text}`}
                onClick={() => choose(i)}
              >
                {votes && <span className="mi-bar" style={{ width: `${votes[i]}%` }} aria-hidden />}
                <span className="mi-letter">{LETTERS[i]}</span>
                <span className="mi-text">{text}</span>
                {votes && <span className="mi-pct">{votes[i]} %</span>}
              </button>
            )
          })}
        </div>

        <div className="mi-bar-actions">
          <div className="mi-lifelines" role="group" aria-label="Comodines">
            <button
              className={`mi-life ${used.fifty ? 'used' : ''}`}
              disabled={used.fifty || phase !== 'asking'}
              onClick={fifty}
              aria-label="Comodín 50/50: quita dos respuestas incorrectas"
            >
              <b>50/50</b>
              <small>Quitar 2</small>
            </button>
            <button
              className={`mi-life ${used.consult ? 'used' : ''}`}
              disabled={used.consult || phase !== 'asking'}
              onClick={startConsult}
              aria-label={isTeam ? 'Consultar al equipo' : 'Consultar a la clase'}
            >
              <b>{isTeam ? '👥' : '🏫'}</b>
              <small>{isTeam ? 'Al equipo' : 'A la clase'}</small>
            </button>
            <button
              className={`mi-life ${used.crowd ? 'used' : ''}`}
              disabled={used.crowd || phase !== 'asking'}
              onClick={askCrowd}
              aria-label="Ayuda del público"
            >
              <b>📊</b>
              <small>Público</small>
            </button>
          </div>
          <div className="mi-go">
            {phase === 'asking' && (
              <>
                <button className="mi-walk" onClick={() => setConfirm('walk')}>
                  Retirarse
                  <small>{sum(wonSoFar(spec, level))}</small>
                </button>
                <button className="mi-final" disabled={picked === null} onClick={lock}>
                  Respuesta final
                  <small>Enter</small>
                </button>
              </>
            )}
            {phase === 'suspense' && <span className="mi-wait">¿Será?…</span>}
            {phase === 'revealed' && (
              <button className="mi-final" ref={nextRef} onClick={next}>
                {!correct ? 'Seguir' : last ? '¡Premio mayor!' : 'Siguiente'} →
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="mi-ladder" aria-label="Escalera de premios">
        {spec.prizes
          .map((_, i) => i)
          .reverse()
          .map((i) => {
            const state =
              i < level || (i === level && phase === 'revealed' && correct)
                ? 'done'
                : i === level
                  ? 'now'
                  : ''
            return (
              <div
                key={i}
                className={`mi-step ${state} ${spec.safe.includes(i) ? 'safe' : ''}`}
                aria-current={i === level ? 'step' : undefined}
              >
                <span className="mi-step-n">{i + 1}</span>
                <span className="mi-step-prize">{sum(spec.prizes[i])}</span>
              </div>
            )
          })}
      </aside>

      {confirm && (
        <div className="mi-modal" role="dialog" aria-modal="true">
          <div className="mi-dialog">
            {confirm === 'walk' ? (
              <>
                <p className="mi-dialog-title">¿Retirarse?</p>
                <p>
                  Se lleva <b>{sum(wonSoFar(spec, level))}</b> y se acaba su turno.
                </p>
              </>
            ) : (
              <>
                <p className="mi-dialog-title">¿Salir del juego?</p>
                <p>Se pierde la partida.</p>
              </>
            )}
            <div className="mi-dialog-actions">
              <button className="mi-final" autoFocus onClick={() => setConfirm(null)}>
                Seguir jugando
              </button>
              <button
                className="mi-walk"
                onClick={() => (confirm === 'walk' ? (setConfirm(null), walk()) : onExit())}
              >
                {confirm === 'walk' ? 'Sí, retirarse' : 'Sí, salir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
