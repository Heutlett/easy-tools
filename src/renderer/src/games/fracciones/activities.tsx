import { useEffect, useState } from 'react'
import { sfx } from '../../lib/games/sfx'
import { shuffle } from '../../lib/games/shuffle'
import Choices from '../_manip/Choices'
import type { Ctx } from '../_manip/Runner'
import { chance, lcm, oneOf, rand, takeUnique } from '../_manip/util'
import Shape, { Frac, ValueView } from './Shapes'
import {
  fracWords,
  levelOf,
  numeric,
  sameValue,
  valText,
  valWords,
  type Kind,
  type Val
} from './data'

const pickKind = (maxDen: number): Kind =>
  oneOf<Kind>(maxDen <= 12 ? ['circle', 'bar', 'grid'] : ['bar', 'grid'])
const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i)
const gcdOf = (a: number, b: number): number => (b ? gcdOf(b, a % b) : a)

// ---------- Generación de fracciones por nivel ----------

interface Fig {
  val: Val
  n: number
  d: number
  units: number
  kind: Kind
}

/** Una fracción para colorear o reconocer, según el nivel */
function makeFig(levelId: number, allowSpecial = true): Fig {
  const level = levelOf(levelId)
  const kind = pickKind(12)
  if (levelId >= 5 && chance(levelId === 5 ? 0.5 : 0.25)) {
    const d = oneOf([2, 3, 4, 5])
    const n = rand(d + 1, 2 * d - 1)
    const mixed = n % d !== 0 && chance(0.5)
    return {
      val: mixed ? { t: 'm', w: 1, n: n - d, d } : { t: 'f', n, d },
      n,
      d,
      units: 2,
      kind
    }
  }
  if (levelId === 6 && allowSpecial && chance(0.65)) {
    const d = oneOf([2, 4, 5, 10])
    const n = rand(1, d - 1)
    const x = n / d
    return {
      val: chance(0.5) ? { t: 'dec', x } : { t: 'pct', x: Math.round(x * 100) },
      n,
      d,
      units: 1,
      kind
    }
  }
  const d = oneOf(level.dens)
  const n = rand(1, d - 1)
  return { val: { t: 'f', n, d }, n, d, units: 1, kind }
}

// ---------- Mecánica de colorear y comprobar ----------

/** Estado de las partes coloreadas, con comprobación en dos intentos y teclado (↑ colorea, ↓ quita, Enter comprueba) */
function usePaint(
  ctx: Ctx,
  target: number,
  total: number,
  okMessage: string,
  failMessage: string
): {
  filled: Set<number>
  toggle: (i: number) => void
  check: () => void
  clear: () => void
  hint: string
  done: boolean
} {
  const [filled, setFilled] = useState<Set<number>>(new Set())
  const [tries, setTries] = useState(0)
  const [hint, setHint] = useState('')
  const done = ctx.resolved !== null

  const toggle = (i: number): void => {
    if (done) return
    const next = new Set(filled)
    if (next.has(i)) {
      next.delete(i)
      sfx.tick()
    } else {
      next.add(i)
      sfx.pop()
    }
    setFilled(next)
    setHint('')
  }
  const check = (): void => {
    if (done) return
    if (filled.size === target) ctx.resolve(true, okMessage)
    else if (tries === 0) {
      setTries(1)
      sfx.wrong()
      setHint(
        filled.size === 0
          ? 'Toca las partes para colorearlas'
          : filled.size > target
            ? 'Hay partes de más'
            : 'Faltan partes por colorear'
      )
    } else {
      setFilled(new Set(range(target)))
      ctx.resolve(false, failMessage)
    }
  }
  const clear = (): void => (setFilled(new Set()), setHint(''))

  useEffect(() => {
    if (done) return
    const onKey = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || e.repeat) return
      if (e.key === 'Enter' && tag === 'BODY') {
        e.preventDefault()
        check()
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        const next = new Set(filled)
        if (e.key === 'ArrowUp') {
          const free = range(total).find((i) => !next.has(i))
          if (free !== undefined) next.add(free)
          sfx.pop()
        } else {
          const last = Math.max(-1, ...next)
          next.delete(last)
          sfx.tick()
        }
        setFilled(next)
        setHint('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  return { filled, toggle, check, clear, hint, done }
}

function Controls({
  paint,
  extra
}: {
  paint: ReturnType<typeof usePaint>
  extra?: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="fr-controls">
      <div className="fr-hint">{paint.done ? '' : paint.hint || ' '}</div>
      <div className="row start">
        <button className="btn big" disabled={paint.done} onClick={paint.check}>
          Comprobar ✔
        </button>
        <button
          className="btn secondary"
          disabled={paint.done || paint.filled.size === 0}
          onClick={paint.clear}
        >
          Borrar
        </button>
        {extra}
        <span className="muted fr-keys">↑ ↓ colorear y quitar · Enter comprobar</span>
      </div>
    </div>
  )
}

// ---------- Colorea la fracción ----------

export function Paint({ ctx, level }: { ctx: Ctx; level: number }): React.JSX.Element {
  const [q] = useState(() => makeFig(level))
  const total = q.d * q.units
  const paint = usePaint(
    ctx,
    q.n,
    total,
    `Son ${valText(q.val)}`,
    `Eran ${q.n} ${q.n === 1 ? 'parte' : 'partes'}: ${valText(q.val)}`
  )
  const words = valWords(q.val)
  const size = q.units > 1 ? 150 : q.kind === 'circle' ? 220 : q.kind === 'bar' ? 150 : 190
  return (
    <div className="fr-play">
      <div className="fr-ask">
        <span className="fr-ask-label">Colorea</span>
        <span className="fr-ask-value">
          <ValueView v={q.val} />
        </span>
        {words && <span className="fr-ask-words">{words}</span>}
        {(q.val.t === 'dec' || q.val.t === 'pct') && (
          <span className="fr-ask-words">La figura tiene {q.d} partes iguales</span>
        )}
      </div>
      <div className="fr-stage-shape">
        <Shape
          kind={q.kind}
          parts={q.d}
          units={q.units}
          filled={paint.filled}
          onToggle={paint.toggle}
          size={size}
          locked={paint.done}
        />
      </div>
      <Controls paint={paint} />
    </div>
  )
}

// ---------- ¿Qué fracción es? ----------

function distractorsFor(c: Val): Val[] {
  const out: Val[] = []
  if (c.t === 'f' && c.n < c.d) {
    const { n, d } = c
    out.push(
      { t: 'f', n: n + 1, d },
      { t: 'f', n: n - 1, d },
      { t: 'f', n, d: d + 1 },
      { t: 'f', n, d: d - 1 },
      { t: 'f', n: d - n, d }
    )
    out.push(
      { t: 'f', n: n + 2, d },
      { t: 'f', n: n - 2, d },
      { t: 'f', n: n + 1, d: d + 1 },
      { t: 'f', n: n + 1, d: d + 2 }
    )
    return out.filter((v) => v.t === 'f' && v.n >= 1 && v.d >= 2 && v.n < v.d)
  }
  if (c.t === 'f') {
    const { n, d } = c
    out.push(
      { t: 'f', n: n + 1, d },
      { t: 'f', n: n - 1, d },
      { t: 'f', n, d: d + 1 },
      { t: 'f', n, d: d - 1 },
      { t: 'f', n: d, d: n - d }
    )
    out.push({ t: 'f', n: n + 2, d }, { t: 'f', n: n - 2, d })
    return out.filter((v) => v.t === 'f' && v.n > v.d && v.d >= 2)
  }
  if (c.t === 'm') {
    const { w, n, d } = c
    out.push(
      { t: 'm', w, n: d - n, d },
      { t: 'm', w: w + 1, n, d },
      { t: 'm', w: w - 1 || 2, n, d },
      { t: 'm', w, n: n + 1, d },
      { t: 'm', w, n: n - 1, d },
      { t: 'm', w: n, n: w, d }
    )
    return out.filter((v) => v.t === 'm' && v.w >= 1 && v.n >= 1 && v.n < v.d)
  }
  if (c.t === 'dec') {
    const x = c.x
    for (const y of [
      x + 0.1,
      x - 0.1,
      x + 0.25,
      x - 0.25,
      x / 10,
      x * 10,
      1 - x,
      x + 0.05,
      x - 0.05
    ])
      out.push({ t: 'dec', x: Math.round(y * 1000) / 1000 })
    return out.filter((v) => v.t === 'dec' && v.x > 0 && v.x < 10)
  }
  const x = c.x
  for (const y of [x + 10, x - 10, x + 5, x - 5, x + 25, x - 25, 100 - x, x / 10, x * 2])
    out.push({ t: 'pct', x: Math.round(y) })
  return out.filter((v) => v.t === 'pct' && v.x > 0 && v.x <= 100)
}

function buildOptions(correct: Val): Val[] {
  const wrong = takeUnique(
    distractorsFor(correct).filter((v) => !sameValue(v, correct)),
    3,
    (v) => numeric(v).toFixed(6)
  )
  let guard = 0
  while (wrong.length < 3 && guard++ < 50) {
    const extra: Val =
      correct.t === 'dec'
        ? { t: 'dec', x: Math.round(rand(1, 19) * 5) / 100 }
        : correct.t === 'pct'
          ? { t: 'pct', x: rand(1, 19) * 5 }
          : correct.t === 'm'
            ? { t: 'm', w: rand(1, 2), n: rand(1, correct.d - 1), d: correct.d }
            : { t: 'f', n: rand(1, correct.d), d: rand(2, 10) }
    const ok =
      !sameValue(extra, correct) &&
      !wrong.some((w) => sameValue(w, extra)) &&
      (extra.t !== 'f' || correct.t !== 'f' || extra.n < extra.d === correct.n < correct.d)
    if (ok) wrong.push(extra)
  }
  return shuffle([correct, ...wrong])
}

export function Identify({ ctx, level }: { ctx: Ctx; level: number }): React.JSX.Element {
  const [q] = useState(() => {
    const fig = makeFig(level)
    const options = buildOptions(fig.val)
    return { fig, options }
  })
  const { fig } = q
  const size = fig.units > 1 ? 150 : fig.kind === 'circle' ? 210 : fig.kind === 'bar' ? 140 : 180
  const question =
    fig.val.t === 'm'
      ? '¿Qué número mixto es?'
      : fig.val.t === 'dec'
        ? '¿Qué número decimal está coloreado?'
        : fig.val.t === 'pct'
          ? '¿Qué porcentaje está coloreado?'
          : fig.units > 1
            ? '¿Qué fracción impropia es?'
            : '¿Qué fracción está coloreada?'
  return (
    <div className="fr-play fr-identify">
      <div className="fr-stage-shape">
        <Shape kind={fig.kind} parts={fig.d} units={fig.units} filled={fig.n} size={size} />
      </div>
      <div className="fr-side">
        <p className="fr-question">{question}</p>
        <Choices
          ctx={ctx}
          answerId={valText(fig.val)}
          explain={`Es ${valText(fig.val)}${valWords(fig.val) ? `: ${valWords(fig.val)}` : ''}`}
          choices={q.options.map((o) => ({
            id: valText(o),
            label: valText(o),
            content: (
              <span className="fr-opt">
                <ValueView v={o} />
              </span>
            )
          }))}
        />
      </div>
    </div>
  )
}

// ---------- Compara ----------

type Sign = '<' | '=' | '>'

function makeCompare(levelId: number): { a: Val; b: Val } {
  const f = (n: number, d: number): Val => ({ t: 'f', n, d })
  const level = levelOf(levelId)
  if (levelId === 3) {
    const r = rand(0, 3)
    if (r <= 1) {
      const d = oneOf([2, 3, 4])
      const n1 = rand(1, d - 1)
      let n2 = rand(1, d - 1)
      if (d > 2 && n2 === n1 && chance(0.7)) n2 = n1 === 1 ? 2 : 1
      return { a: f(n1, d), b: f(n2, d) }
    }
    if (r === 2) {
      const [d1, d2] = oneOf([
        [2, 3],
        [2, 4],
        [3, 4],
        [3, 2],
        [4, 2],
        [4, 3]
      ])
      return { a: f(1, d1), b: f(1, d2) }
    }
    return { a: f(1, 2), b: f(2, 4) }
  }
  if (levelId === 4) {
    const r = rand(0, 9)
    if (r < 4) {
      const d = oneOf(level.dens)
      const n1 = rand(1, d - 1)
      const n2 = rand(1, d - 1)
      return { a: f(n1, d), b: f(n2, d) }
    }
    if (r < 6) {
      const n = rand(1, 3)
      const [d1, d2] = oneOf([
        [2, 4],
        [3, 5],
        [4, 6],
        [5, 8],
        [3, 8],
        [6, 10],
        [4, 5],
        [2, 3]
      ]).map((x) => Math.max(x, n + 1))
      return { a: f(n, d1), b: f(n, d2) }
    }
    if (r < 7) {
      const b = oneOf([2, 3, 4, 5])
      const n = rand(1, b - 1)
      const k = oneOf([2, 3])
      return { a: f(n, b), b: f(n * k, b * k) }
    }
    const d = oneOf([3, 5, 7, 8, 10].filter((x) => x <= 10))
    return { a: f(rand(1, d - 1), d), b: f(1, 2) }
  }
  const dens = levelId === 5 ? [2, 3, 4, 5, 10] : [2, 3, 4, 5, 6, 8, 10, 12]
  if (levelId === 6 && chance(0.5)) {
    const d = oneOf([2, 4, 5, 10])
    const n = rand(1, d - 1)
    const x = n / d
    const near = oneOf([x, x + 0.1, x - 0.1, x + 0.05, x - 0.05].filter((y) => y > 0 && y < 1))
    const other: Val = chance(0.5)
      ? { t: 'dec', x: Math.round(near * 100) / 100 }
      : { t: 'pct', x: Math.round(near * 100) }
    return chance(0.5) ? { a: f(n, d), b: other } : { a: other, b: f(n, d) }
  }
  const mk = (): Val => {
    const d = oneOf(dens)
    const n = rand(1, 2 * d - 1)
    if (n > d && n % d !== 0 && chance(0.5)) return { t: 'm', w: Math.floor(n / d), n: n % d, d }
    return f(n, d)
  }
  const a = mk()
  if (chance(0.2) && a.t === 'f') {
    const k = oneOf([2, 3])
    if (a.d * k <= 12) return { a, b: f(a.n * k, a.d * k) }
  }
  return { a, b: mk() }
}

const signOf = (a: Val, b: Val): Sign => {
  const d = numeric(a) - numeric(b)
  return Math.abs(d) < 1e-9 ? '=' : d < 0 ? '<' : '>'
}

/** Figura de un valor (para el dibujo de «Compara»): fracciones con sus partes; decimales y porcentajes en 100 partes */
function figureOf(v: Val, kind: Kind, size: number): React.JSX.Element {
  if (v.t === 'f' || v.t === 'm') {
    const w = v.t === 'm' ? v.w : 0
    const filled = v.t === 'm' ? w * v.d + v.n : v.n
    const units = Math.max(1, Math.ceil(filled / v.d))
    return (
      <Shape
        kind={kind}
        parts={v.d}
        units={units}
        filled={filled}
        size={units > 1 ? size * 0.7 : size}
      />
    )
  }
  return <Shape kind="grid" parts={100} filled={Math.round(numeric(v) * 100)} size={size * 0.8} />
}

export function Compare({ ctx, level }: { ctx: Ctx; level: number }): React.JSX.Element {
  const [q] = useState(() => {
    const { a, b } = makeCompare(level)
    return { a, b, kind: pickKind(12), answer: signOf(a, b) }
  })
  const [shown, setShown] = useState(level < 5)
  const [picked, setPicked] = useState<Sign | null>(null)
  const done = ctx.resolved !== null
  const visible = shown || done
  const size = q.kind === 'circle' ? 150 : q.kind === 'bar' ? 100 : 130

  const pick = (s: Sign): void => {
    if (done) return
    setPicked(s)
    ctx.resolve(s === q.answer, `${valText(q.a)} ${q.answer} ${valText(q.b)}`)
  }
  useEffect(() => {
    if (done) return
    const onKey = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      const map: Record<string, Sign> = { '<': '<', '>': '>', '=': '=', ',': '<', '.': '>' }
      if (e.key in map) {
        e.preventDefault()
        pick(map[e.key])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const card = (v: Val): React.JSX.Element => (
    <div className="fr-cmp-card">
      <div className="fr-cmp-fig">
        {visible ? figureOf(v, q.kind, size) : <span className="fr-hidden">?</span>}
      </div>
      <div className="fr-cmp-val">
        <ValueView v={v} />
      </div>
    </div>
  )
  return (
    <div className="fr-play fr-compare">
      <p className="fr-question">¿Cuál es mayor? Elige &lt;, = o &gt;</p>
      <div className="fr-cmp-row">
        {card(q.a)}
        <div className="fr-signs" role="group" aria-label="Comparar">
          {(['<', '=', '>'] as Sign[]).map((s) => (
            <button
              key={s}
              className={`fr-sign ${done ? (s === q.answer ? 'correct' : s === picked ? 'wrong' : 'dim') : ''}`}
              disabled={done}
              aria-label={s === '<' ? 'menor que' : s === '>' ? 'mayor que' : 'igual a'}
              onClick={() => pick(s)}
            >
              {s}
            </button>
          ))}
        </div>
        {card(q.b)}
      </div>
      {!done && level >= 5 && (
        <button className="pill fr-peek" aria-pressed={shown} onClick={() => setShown(!shown)}>
          {shown ? '🙈 Ocultar dibujo' : '👁 Ver dibujo'}
        </button>
      )}
    </div>
  )
}

// ---------- Equivalentes ----------

function makeEquiv(levelId: number): { n: number; d: number; d2: number; m: number; kind: Kind } {
  const kind = pickKind(12)
  if (levelId <= 3) {
    const b = oneOf([2, 3, 4])
    const a = rand(1, b - 1)
    const d2 = b * 2
    return { n: a, d: b, d2, m: a * 2, kind }
  }
  for (let i = 0; i < 100; i++) {
    const b = rand(2, 6)
    const a = rand(1, b - 1)
    if (gcdOf(a, b) !== 1) continue
    const k = oneOf([2, 3, 4])
    if (b * k > 12) continue
    if (levelId >= 5 && chance(0.4)) return { n: a * k, d: b * k, d2: b, m: a, kind } // simplificar
    return { n: a, d: b, d2: b * k, m: a * k, kind }
  }
  return { n: 1, d: 2, d2: 4, m: 2, kind }
}

export function Equivalent({ ctx, level }: { ctx: Ctx; level: number }): React.JSX.Element {
  const [q] = useState(() => makeEquiv(level))
  const paint = usePaint(
    ctx,
    q.m,
    q.d2,
    `${q.n}/${q.d} = ${q.m}/${q.d2}`,
    `${q.n}/${q.d} = ${q.m}/${q.d2}`
  )
  const size = q.kind === 'circle' ? 150 : q.kind === 'bar' ? 100 : 130
  return (
    <div className="fr-play">
      <p className="fr-question">Colorea la figura de la derecha para que valga lo mismo</p>
      <div className="fr-cmp-row">
        <div className="fr-cmp-card">
          <div className="fr-cmp-fig">
            <Shape kind={q.kind} parts={q.d} filled={q.n} size={size} />
          </div>
          <div className="fr-cmp-val">
            <Frac n={q.n} d={q.d} />
          </div>
        </div>
        <span className="fr-equal">=</span>
        <div className="fr-cmp-card">
          <div className="fr-cmp-fig">
            <Shape
              kind={q.kind}
              parts={q.d2}
              filled={paint.filled}
              onToggle={paint.toggle}
              size={size}
              locked={paint.done}
            />
          </div>
          <div className="fr-cmp-val">
            <Frac n={paint.done ? q.m : paint.filled.size} d={q.d2} />
          </div>
        </div>
      </div>
      <Controls paint={paint} />
    </div>
  )
}

// ---------- Suma visual ----------

function makeSum(levelId: number): {
  a: [number, number]
  b: [number, number]
  L: number
  target: number
  kind: Kind
} {
  const kind = pickKind(12)
  if (levelId < 6 || chance(0.35)) {
    const d = oneOf(levelId <= 3 ? [3, 4] : [3, 4, 5, 6, 8, 10])
    const n1 = rand(1, d - 2)
    const n2 = rand(1, d - n1)
    return { a: [n1, d], b: [n2, d], L: d, target: n1 + n2, kind }
  }
  for (let i = 0; i < 200; i++) {
    const [d1, d2] = oneOf([
      [2, 4],
      [2, 6],
      [3, 6],
      [4, 8],
      [2, 8],
      [5, 10],
      [2, 10],
      [2, 3],
      [3, 4],
      [4, 6],
      [2, 5]
    ])
    const L = lcm(d1, d2)
    if (L > 12) continue
    const n1 = rand(1, d1 - 1)
    const n2 = rand(1, d2 - 1)
    const target = (n1 * L) / d1 + (n2 * L) / d2
    if (target > L) continue
    return { a: [n1, d1], b: [n2, d2], L, target, kind }
  }
  return { a: [1, 4], b: [1, 4], L: 4, target: 2, kind }
}

export function Sum({ ctx, level }: { ctx: Ctx; level: number }): React.JSX.Element {
  const [q] = useState(() => makeSum(level))
  const paint = usePaint(ctx, q.target, q.L, `${q.target}/${q.L}`, `Era ${q.target}/${q.L}`)
  const size = q.kind === 'circle' ? 120 : q.kind === 'bar' ? 80 : 100
  const hetero = q.a[1] !== q.b[1]
  return (
    <div className="fr-play">
      <p className="fr-question">Suma las fracciones y colorea el resultado</p>
      <div className="fr-cmp-row fr-sumrow">
        <div className="fr-cmp-card">
          <div className="fr-cmp-fig">
            <Shape kind={q.kind} parts={q.a[1]} filled={q.a[0]} size={size} />
          </div>
          <div className="fr-cmp-val small">
            <Frac n={q.a[0]} d={q.a[1]} />
          </div>
        </div>
        <span className="fr-equal">+</span>
        <div className="fr-cmp-card">
          <div className="fr-cmp-fig">
            <Shape kind={q.kind} parts={q.b[1]} filled={q.b[0]} size={size} />
          </div>
          <div className="fr-cmp-val small">
            <Frac n={q.b[0]} d={q.b[1]} />
          </div>
        </div>
        <span className="fr-equal">=</span>
        <div className="fr-cmp-card">
          <div className="fr-cmp-fig">
            <Shape
              kind={q.kind}
              parts={q.L}
              filled={paint.filled}
              onToggle={paint.toggle}
              size={size * 1.15}
              locked={paint.done}
            />
          </div>
          <div className="fr-cmp-val small">
            <Frac n={paint.done ? q.target : paint.filled.size} d={q.L} />
          </div>
        </div>
      </div>
      {hetero && (
        <p className="muted fr-center">
          La figura de la derecha tiene {q.L} partes: {fracWords(1, q.L)} cada una.
        </p>
      )}
      <Controls paint={paint} />
    </div>
  )
}
