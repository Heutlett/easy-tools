import type { InputType, Problem } from './data'

/** Un tamaño de letra que se achica cuando la operación es larga, para que siempre quepa en una línea o dos */
function sizeClass(text: string): string {
  const n = text.replace(/\s/g, '').length
  return n <= 11 ? 'xl' : n <= 17 ? 'lg' : n <= 24 ? 'md' : 'sm'
}

function Fraction({ value }: { value: string }): React.JSX.Element {
  const [n, d] = value.split('/')
  return (
    <span className="cm-frac" aria-label={`${n} sobre ${d}`}>
      <span>{n}</span>
      <span>{d}</span>
    </span>
  )
}

/** Escribe la respuesta (o lo que se lleva escrito) con fracciones apiladas */
function Value({ value }: { value: string }): React.JSX.Element {
  return /^\d+\/\d+$/.test(value) ? <Fraction value={value} /> : <>{value}</>
}

interface ExprProps {
  problem: Problem
  /** Lo que va en el recuadro: la respuesta, lo que se lleva escrito, o nada («?») */
  fill?: string
  state?: 'idle' | 'revealed' | 'right' | 'wrong' | 'typing'
}

/** La operación en grande, con el recuadro de la respuesta */
export function Expr({ problem, fill, state = 'idle' }: ExprProps): React.JSX.Element {
  const tokens = problem.text.split(/(__|\d+\/\d+)/).filter(Boolean)
  return (
    <div className={`cm-expr ${sizeClass(problem.text)}`} role="img" aria-label={problem.text}>
      {tokens.map((tok, i) =>
        tok === '__' ? (
          <span key={i} className={`cm-box ${state} ${fill ? 'has' : ''}`}>
            {fill ? <Value value={fill} /> : '?'}
            {state === 'typing' && <span className="cm-caret" aria-hidden />}
          </span>
        ) : /^\d+\/\d+$/.test(tok) ? (
          <Fraction key={i} value={tok} />
        ) : (
          <span key={i} className="cm-tok">
            {tok}
          </span>
        )
      )}
    </div>
  )
}

/** Número grande con barra que baja */
export function TimerBar({
  left,
  total,
  paused
}: {
  left: number
  total: number
  paused?: boolean
}): React.JSX.Element {
  const seconds = Math.ceil(left / 1000)
  const low = left > 0 && seconds <= 3
  return (
    <div className={`cm-timer ${low ? 'low' : ''} ${left === 0 ? 'done' : ''}`}>
      <span className="cm-timer-num" aria-live="off">
        {left === 0 ? '⏰' : paused ? '…' : seconds}
      </span>
      <div className="cm-timer-bar" aria-hidden>
        <div className="cm-timer-fill" style={{ width: `${total ? (left / total) * 100 : 0}%` }} />
      </div>
    </div>
  )
}

interface KeypadProps {
  input: InputType
  onKey: (key: string) => void
  onSubmit: () => void
  disabled?: boolean
}

/** Teclado numérico en pantalla (o los tres símbolos para comparar) */
export function Keypad({ input, onKey, onSubmit, disabled }: KeypadProps): React.JSX.Element {
  if (input === 'cmp') {
    return (
      <div className="cm-keypad cmp" role="group" aria-label="Símbolos">
        {(['<', '=', '>'] as const).map((s) => (
          <button key={s} className="cm-key sym" disabled={disabled} onClick={() => onKey(s)}>
            {s}
          </button>
        ))}
      </div>
    )
  }
  const extra = input === 'dec' ? ',' : input === 'frac' ? '/' : ''
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', extra, '0', '⌫']
  return (
    <div className="cm-keypad" role="group" aria-label="Teclado numérico">
      {keys.map((k, i) =>
        k === '' ? (
          <span key={i} />
        ) : (
          <button
            key={i}
            className={`cm-key ${k === '⌫' ? 'del' : ''}`}
            disabled={disabled}
            aria-label={k === '⌫' ? 'Borrar' : k === ',' ? 'Coma' : k === '/' ? 'Fracción' : k}
            onClick={() => onKey(k === '⌫' ? 'Backspace' : k)}
          >
            {k}
          </button>
        )
      )}
      <button className="cm-key ok" disabled={disabled} onClick={onSubmit}>
        ✔ Responder
      </button>
    </div>
  )
}

/** Lista de operaciones con su respuesta, para repasar al final */
export function Review({
  problems,
  marks
}: {
  problems: Problem[]
  marks?: (boolean | null)[]
}): React.JSX.Element {
  return (
    <ol className="cm-review">
      {problems.map((p, i) => {
        const shown = p.text.replace('__', p.answer)
        const mark = marks?.[i]
        return (
          <li key={i} className={mark === true ? 'ok' : mark === false ? 'bad' : ''}>
            {mark === true ? '✅ ' : mark === false ? '❌ ' : ''}
            {shown}
          </li>
        )
      })}
    </ol>
  )
}
