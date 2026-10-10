import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'
import { useClassrooms } from '../../lib/classrooms'
import { GRADES, type Grade } from '../../content/types'
import { gradeLabel } from '../../content/subjects'
import { shuffle } from '../../lib/games/shuffle'
import { sfx } from '../../lib/games/sfx'
import { usePersistentState } from '../../lib/usePersistentState'
import { noFocusedButton, useKeys } from '../_lectura/keys'
import { Choice, EndScreen, OptionRow, TopBar } from '../_lectura/ui'
import { KINDS, itemsFor, kindAvailable, type KindId } from './data'
import { formatTime, wordsPerMinute } from './logic'
import { TEXTS, countWords, type ReadingText } from './texts'

type Mode = 'flash' | 'read'
interface Config {
  mode: Mode
  grade: Grade
  kind: KindId
  /** Cuántas palabras salen a la vez */
  chain: 1 | 2 | 3 | 4
  /** Milisegundos por palabra */
  speed: number
  rounds: number
}

const DEFAULTS: Config = { mode: 'flash', grade: 1, kind: 'dos', chain: 1, speed: 2000, rounds: 10 }

const SPEEDS: { ms: number; label: string }[] = [
  { ms: 3000, label: '3 s' },
  { ms: 2000, label: '2 s' },
  { ms: 1500, label: '1,5 s' },
  { ms: 1000, label: '1 s' },
  { ms: 500, label: '0,5 s' }
]

/** Una lectura terminada, para comparar durante la sesión */
export interface Result {
  name: string
  title: string
  grade: Grade
  words: number
  ms: number
  errors: number
}

type Phase =
  | { name: 'setup' }
  | { name: 'flash'; config: Config }
  | { name: 'read'; config: Config; text: ReadingText }

export default function LecturaVeloz(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })
  const [saved, setSaved] = usePersistentState<Config>('game:lectura-veloz:config', DEFAULTS)
  // El historial vive aquí para que no se pierda al cambiar de texto (se borra al salir del juego)
  const [history, setHistory] = useState<Result[]>([])
  const config: Config = { ...DEFAULTS, ...saved }

  if (phase.name === 'setup')
    return (
      <Setup
        config={config}
        onChange={setSaved}
        onFlash={() => setPhase({ name: 'flash', config })}
        onRead={(text) => setPhase({ name: 'read', config, text })}
      />
    )
  if (phase.name === 'flash')
    return <Flash config={phase.config} onExit={() => setPhase({ name: 'setup' })} />
  return (
    <Reading
      key={phase.text.id}
      text={phase.text}
      history={history}
      onResult={(r) => setHistory((h) => [...h, r])}
      onPick={(text) => setPhase({ name: 'read', config: phase.config, text })}
      onExit={() => setPhase({ name: 'setup' })}
    />
  )
}

function Setup({
  config,
  onChange,
  onFlash,
  onRead
}: {
  config: Config
  onChange: (c: Config) => void
  onFlash: () => void
  onRead: (text: ReadingText) => void
}): React.JSX.Element {
  const set = (patch: Partial<Config>): void => onChange({ ...config, ...patch })
  const setGrade = (grade: Grade): void => {
    const kind = kindAvailable(config.kind, grade)
      ? config.kind
      : (KINDS.find((k) => kindAvailable(k.id, grade))?.id ?? 'dos')
    set({ grade, kind })
  }
  const texts = TEXTS.filter((t) => t.grade === config.grade)
  const [textId, setTextId] = useState<string | null>(null)
  const chosen = texts.find((t) => t.id === textId) ?? texts[0]

  return (
    <section className="panel lec-setup vel-setup">
      <OptionRow label="¿Qué hacemos?">
        <Choice selected={config.mode === 'flash'} onClick={() => set({ mode: 'flash' })}>
          ⚡ Palabras relámpago
        </Choice>
        <Choice selected={config.mode === 'read'} onClick={() => set({ mode: 'read' })}>
          ⏱️ Lectura cronometrada
        </Choice>
      </OptionRow>
      <OptionRow label="Grado">
        {GRADES.map((g) => (
          <Choice key={g} selected={config.grade === g} onClick={() => setGrade(g)}>
            {gradeLabel(g)}
          </Choice>
        ))}
      </OptionRow>

      {config.mode === 'flash' ? (
        <>
          <OptionRow label="Qué se lee">
            {KINDS.map((k) => (
              <Choice
                key={k.id}
                selected={config.kind === k.id}
                disabled={!kindAvailable(k.id, config.grade)}
                title={k.hint}
                onClick={() => set({ kind: k.id })}
              >
                {k.icon} {k.title}
              </Choice>
            ))}
          </OptionRow>
          <OptionRow label="Velocidad" hint="por cada palabra">
            {SPEEDS.map((s) => (
              <Choice
                key={s.ms}
                selected={config.speed === s.ms}
                onClick={() => set({ speed: s.ms })}
              >
                {s.label}
              </Choice>
            ))}
          </OptionRow>
          <OptionRow label="A la vez" hint="cadena de palabras">
            {([1, 2, 3, 4] as const).map((n) => (
              <Choice
                key={n}
                selected={config.chain === n}
                disabled={config.kind === 'frases'}
                onClick={() => set({ chain: n })}
              >
                {n === 1 ? '1 palabra' : `${n} palabras`}
              </Choice>
            ))}
          </OptionRow>
          <OptionRow label="Rondas">
            {[10, 20, 30].map((n) => (
              <Choice key={n} selected={config.rounds === n} onClick={() => set({ rounds: n })}>
                {n}
              </Choice>
            ))}
          </OptionRow>
          <div className="row start">
            <button className="btn big" onClick={onFlash}>
              Empezar
            </button>
            <span className="muted">
              {itemsFor(config.kind, config.grade).length} para este grado
            </span>
          </div>
        </>
      ) : (
        <>
          <OptionRow label="Texto">
            {texts.map((t) => (
              <Choice key={t.id} selected={chosen?.id === t.id} onClick={() => setTextId(t.id)}>
                {t.kind === 'Rima' ? '🎶' : t.kind === 'Costa Rica' ? '🇨🇷' : '📖'} {t.title}
                <span className="vel-pill-count"> · {countWords(t.text)} palabras</span>
              </Choice>
            ))}
          </OptionRow>
          <div className="row start">
            <button className="btn big" disabled={!chosen} onClick={() => chosen && onRead(chosen)}>
              Empezar
            </button>
            <span className="muted">Textos originales de la app</span>
          </div>
        </>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------------------------
// Palabras relámpago

type FlashState = 'ready' | 'show' | 'hidden' | 'reveal'

/** Tamaño de la letra según cuánto hay que mostrar (cabe en una línea, o en dos o tres si es una frase larga) */
function flashSize(text: string): string {
  const n = text.length
  const lines = n > 56 ? 3 : n > 26 ? 2 : 1
  const px = Math.max(44, Math.min(180, (880 * lines) / (0.78 * n)))
  return `${(px / 18).toFixed(2)}rem`
}

function Flash({ config, onExit }: { config: Config; onExit: () => void }): React.JSX.Element {
  const per = config.kind === 'frases' ? 1 : config.chain
  const groups = useMemo(() => {
    const items = itemsFor(config.kind, config.grade)
    const out: string[] = []
    let deck = shuffle(items)
    for (let r = 0; r < config.rounds; r++) {
      const parts: string[] = []
      while (parts.length < per) {
        if (deck.length === 0) deck = shuffle(items)
        parts.push(deck.pop()!)
      }
      out.push(parts.join(' '))
    }
    return out
  }, [config, per])

  const [index, setIndex] = useState(0)
  const [state, setState] = useState<FlashState>('ready')
  const [run, setRun] = useState(0)
  const [finished, setFinished] = useState(false)
  const text = groups[index]
  const words = text.split(' ').length
  const duration = config.speed * words

  useEffect(() => {
    if (state !== 'show') return
    const id = setTimeout(() => setState('hidden'), duration)
    return () => clearTimeout(id)
  }, [state, run, duration])

  const show = (): void => {
    sfx.pop()
    setRun((r) => r + 1)
    setState('show')
  }
  const next = (): void => {
    if (index + 1 < groups.length) {
      setIndex(index + 1)
      setState('ready')
    } else {
      sfx.win()
      setFinished(true)
    }
  }

  useKeys((e) => {
    if (finished) return
    const go =
      e.key === 'ArrowRight' ||
      e.key === 'PageDown' ||
      ((e.key === ' ' || e.key === 'Enter') && noFocusedButton(e))
    if (go) {
      e.preventDefault()
      if (state === 'ready') show()
      else if (state === 'hidden' || state === 'reveal') next()
    } else if ((e.key === 'r' || e.key === 'R') && (state === 'hidden' || state === 'reveal'))
      show()
    else if ((e.key === 'v' || e.key === 'V') && state === 'hidden') setState('reveal')
  })

  if (finished)
    return (
      <EndScreen
        title="🚀 ¡Muy bien!"
        lines={[`${groups.length} rondas de lectura veloz`]}
        players={[]}
        scores={{}}
        ranking={[]}
        leaders={[]}
        onAgain={() => {
          setIndex(0)
          setState('ready')
          setFinished(false)
        }}
        onExit={onExit}
        exitLabel="Cambiar opciones"
      />
    )

  return (
    <div className="g-stage vel-stage">
      <TopBar progress={`${index + 1} / ${groups.length}`} onExit={onExit}>
        <span className="g-badge">
          {SPEEDS.find((s) => s.ms === config.speed)?.label ?? ''} por palabra
        </span>
      </TopBar>

      <div className="vel-screen">
        {state === 'ready' && (
          <div className="vel-msg">
            <span className="vel-msg-emoji">👀</span>
            <span>¿Listos?</span>
          </div>
        )}
        {(state === 'show' || state === 'reveal') && (
          <div
            key={`${index}-${run}-${state}`}
            className={`vel-word ${state === 'reveal' ? 'reveal' : ''}`}
            style={{ fontSize: flashSize(text) }}
          >
            {text}
          </div>
        )}
        {state === 'hidden' && (
          <div className="vel-msg">
            <span className="vel-msg-emoji">🗣️</span>
            <span>¿Qué decía? ¡Díganlo en voz alta!</span>
          </div>
        )}
      </div>

      <div className="vel-bar-wrap" aria-hidden>
        {state === 'show' && (
          <div key={run} className="vel-bar" style={{ animationDuration: `${duration}ms` }} />
        )}
      </div>

      <div className="row vel-actions">
        {state === 'ready' && (
          <button className="btn big" onClick={show}>
            ▶ ¡Ahora!
          </button>
        )}
        {state === 'show' && <span className="muted">&nbsp;</span>}
        {(state === 'hidden' || state === 'reveal') && (
          <>
            <button className="btn secondary big" onClick={show}>
              🔁 Otra vez
            </button>
            {state === 'hidden' && (
              <button className="btn secondary big" onClick={() => setState('reveal')}>
                👁️ Ver
              </button>
            )}
            <button className="btn big" onClick={next}>
              {index + 1 < groups.length ? 'Siguiente →' : 'Terminar'}
            </button>
          </>
        )}
      </div>
      <p className="muted lec-sub">Espacio o → : siguiente · R: otra vez · V: ver</p>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------
// Lectura cronometrada

const FONT_SIZES = [1.5, 1.8, 2.1, 2.5, 3]

function Reading({
  text,
  history,
  onResult,
  onPick,
  onExit
}: {
  text: ReadingText
  history: Result[]
  onResult: (r: Result) => void
  onPick: (t: ReadingText) => void
  onExit: () => void
}): React.JSX.Element {
  const { groups } = useClassrooms()
  const words = useMemo(() => countWords(text.text), [text])
  const [size, setSize] = usePersistentState<number>('game:lectura-veloz:font', 1)
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'ready' | 'reading' | 'done'>('ready')
  const [errors, setErrors] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(0)
  const students = useMemo(
    () => [...new Set(groups.flatMap((g) => g.students.map((s) => s.name)))],
    [groups]
  )
  const used = useMemo(() => [...new Set(history.map((h) => h.name).filter(Boolean))], [history])
  const fontIndex = Math.min(Math.max(size, 0), FONT_SIZES.length - 1)

  useEffect(() => {
    if (status !== 'reading') return
    const id = setInterval(() => setElapsed(performance.now() - startRef.current), 100)
    return () => clearInterval(id)
  }, [status])

  const begin = (): void => {
    sfx.pop()
    startRef.current = performance.now()
    setElapsed(0)
    setErrors(0)
    setStatus('reading')
  }
  const finish = (): void => {
    const ms = performance.now() - startRef.current
    setElapsed(ms)
    setStatus('done')
    sfx.correct()
    onResult({ name: name.trim(), title: text.title, grade: text.grade, words, ms, errors })
  }
  const again = (): void => {
    setStatus('ready')
    setElapsed(0)
    setErrors(0)
  }

  useKeys((e) => {
    if ((e.key === ' ' || e.key === 'Enter') && noFocusedButton(e)) {
      e.preventDefault()
      if (status === 'ready') begin()
      else if (status === 'reading') finish()
    }
  })

  const wpm = wordsPerMinute(words, elapsed)
  const correct = wordsPerMinute(Math.max(0, words - errors), elapsed)
  const sameGrade = TEXTS.filter((t) => t.grade === text.grade)
  const byStudent = useMemo(() => {
    const map = new Map<string, Result[]>()
    for (const r of history)
      map.set(r.name || 'Sin nombre', [...(map.get(r.name || 'Sin nombre') ?? []), r])
    return [...map.entries()]
  }, [history])

  return (
    <div className="g-stage vel-read">
      <div className="vel-read-main">
        <div className="vel-read-head">
          <span className="g-badge">
            {text.kind === 'Rima' ? '🎶' : text.kind === 'Costa Rica' ? '🇨🇷' : '📖'} {text.title}
          </span>
          <span className="g-badge">{words} palabras</span>
          <span className="vel-read-size" role="group" aria-label="Tamaño de la letra">
            <button
              className="icon-btn"
              aria-label="Letra más pequeña"
              disabled={fontIndex === 0}
              onClick={() => setSize(fontIndex - 1)}
            >
              A−
            </button>
            <button
              className="icon-btn"
              aria-label="Letra más grande"
              disabled={fontIndex === FONT_SIZES.length - 1}
              onClick={() => setSize(fontIndex + 1)}
            >
              A+
            </button>
          </span>
        </div>
        <div
          className={`vel-text ${status === 'ready' ? 'blurred' : ''}`}
          style={{ fontSize: `${FONT_SIZES[fontIndex]}rem` }}
          tabIndex={0}
          aria-label="Texto para leer"
        >
          {text.text.split('\n\n').map((p, i) => (
            <p key={i} className={text.kind === 'Rima' ? 'vel-verse' : ''}>
              {p}
            </p>
          ))}
        </div>
      </div>

      <aside className="vel-side">
        <div className="row start">
          <label className="vel-name">
            <span className="muted">¿Quién lee?</span>
            <input
              className="field"
              list="vel-students"
              value={name}
              maxLength={30}
              placeholder="Nombre (opcional)"
              onChange={(e) => setName(e.target.value)}
            />
            <datalist id="vel-students">
              {students.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>
        </div>
        {used.length > 0 && (
          <div className="pills vel-used">
            {used.slice(-6).map((u) => (
              <button key={u} className="pill small" onClick={() => setName(u)}>
                {u}
              </button>
            ))}
          </div>
        )}

        <div className={`vel-clock ${status}`}>{formatTime(elapsed, status === 'reading')}</div>

        {status === 'ready' && (
          <button className="btn big" onClick={begin}>
            ▶ Empezar
          </button>
        )}
        {status === 'reading' && (
          <>
            <button className="btn big vel-stop" onClick={finish}>
              ✔ Terminé
            </button>
            <div className="vel-errors">
              <button
                className="icon-btn"
                aria-label="Quitar un error"
                disabled={errors === 0}
                onClick={() => setErrors(errors - 1)}
              >
                −
              </button>
              <span>Errores: {errors}</span>
              <button
                className="icon-btn plus"
                aria-label="Sumar un error"
                onClick={() => setErrors(errors + 1)}
              >
                +
              </button>
            </div>
          </>
        )}
        {status === 'done' && (
          <div className="vel-result">
            <p className="vel-wpm">
              {wpm}
              <span> palabras por minuto</span>
            </p>
            {errors > 0 && (
              <p className="vel-correct">
                {correct} correctas por minuto ({errors} {errors === 1 ? 'error' : 'errores'})
              </p>
            )}
            <div className="row start">
              <button className="btn" onClick={again}>
                Leer otra vez
              </button>
              {sameGrade.length > 1 && (
                <button
                  className="btn secondary"
                  onClick={() =>
                    onPick(sameGrade[(sameGrade.indexOf(text) + 1) % sameGrade.length])
                  }
                >
                  Otro texto
                </button>
              )}
            </div>
          </div>
        )}

        {byStudent.length > 0 && (
          <div className="vel-history">
            <p className="panel-title">Resultados</p>
            {byStudent.map(([who, list]) => (
              <div key={who} className="vel-hist-row">
                <strong>{who}</strong>
                <span className="vel-hist-list">
                  {list.map((r, i) => (
                    <span key={i} className="vel-chip" title={`${r.title} · ${formatTime(r.ms)}`}>
                      {wordsPerMinute(r.words, r.ms)}
                    </span>
                  ))}
                  <span className="muted"> ppm</span>
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="row start vel-exit">
          <button className="btn secondary small" onClick={onExit}>
            Salir
          </button>
        </div>
      </aside>
    </div>
  )
}
