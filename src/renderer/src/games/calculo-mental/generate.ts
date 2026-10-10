import type { Grade } from '../../content/types'
import { pickOne } from '../../lib/games/shuffle'
import { randomInt } from '../../lib/random'
import {
  ADD_SPECS,
  NBSP,
  DIV_SPECS,
  MUL_SPECS,
  kindAvailable,
  type Config,
  type FactorSpec,
  type Kind,
  type Level,
  type Problem
} from './data'

/* Todo se calcula con enteros (en unidades de 0,1 o 0,01) para que nunca haya errores de redondeo. */

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (n: number): string => [...String(n)].map((d) => SUP[Number(d)]).join('')
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

/** Escribe un número: coma decimal, sin ceros de más y con espacio en los de 5 cifras o más (22 500) */
export function fmt(scaled: number, dec: number): string {
  const s = 10 ** dec
  const whole = Math.floor(scaled / s)
  const rest = scaled % s
  const ws = String(whole)
  const grouped = whole >= 10000 ? ws.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) : ws
  if (dec === 0 || rest === 0) return grouped
  return `${grouped},${String(rest).padStart(dec, '0').replace(/0+$/, '')}`
}

/** Un número entre lo y hi (en unidades escaladas) que no termine en cero cuando hay decimales */
function scaledInt(lo: number, hi: number, dec: number): number {
  const n = randomInt(lo, hi)
  return dec > 0 && n % 10 === 0 ? (n + 1 <= hi ? n + 1 : n - 1) : n
}

interface Triple {
  a: number
  b: number
  c: number
  /** Cifras decimales de cada número (el factor de la tabla y el divisor son enteros) */
  da: number
  db: number
  dc: number
  op: '+' | '−' | '×' | '÷'
}

function genAdd(grade: Grade, level: Level): Triple {
  const { max, dec } = ADD_SPECS[grade][level - 1]
  const top = max * 10 ** dec
  const total = randomInt(Math.max(2, Math.ceil(top * 0.3)), top)
  const a = scaledInt(1, total - 1, dec)
  return { a, b: total - a, c: total, da: dec, db: dec, dc: dec, op: '+' }
}

function genSub(grade: Grade, level: Level): Triple {
  const t = genAdd(grade, level)
  // a − b = c con el total como minuendo
  return { ...t, a: t.c, b: t.a, c: t.b, op: '−' }
}

function bigFactor(spec: FactorSpec): number {
  return scaledInt(spec.lo, spec.hi, spec.dec)
}

function pickTable(tables: number[]): number {
  return pickOne(tables.length ? tables : [2, 3, 4, 5, 10]) as number
}

function genMul(grade: Grade, level: Level, tables: number[]): Triple {
  const spec = MUL_SPECS[grade][level - 1]
  const t = pickTable(tables)
  const big = bigFactor(spec)
  const c = big * t
  return randomInt(0, 1) === 1
    ? { a: big, b: t, c, da: spec.dec, db: 0, dc: spec.dec, op: '×' }
    : { a: t, b: big, c, da: 0, db: spec.dec, dc: spec.dec, op: '×' }
}

function genDiv(grade: Grade, level: Level, tables: number[]): Triple {
  const spec = DIV_SPECS[grade][level - 1]
  const t = pickTable(tables)
  const q = bigFactor(spec)
  return { a: q * t, b: t, c: q, da: spec.dec, db: 0, dc: spec.dec, op: '÷' }
}

const expr = (t: Triple): string => `${fmt(t.a, t.da)} ${t.op} ${fmt(t.b, t.db)}`

function base(kind: Kind, grade: Grade, level: Level, tables: number[]): Triple {
  switch (kind) {
    case 'sub':
      return genSub(grade, level)
    case 'mul':
      return genMul(grade, level, tables)
    case 'div':
      return genDiv(grade, level, tables)
    default:
      return genAdd(grade, level)
  }
}

const inputOf = (dec: number): 'int' | 'dec' => (dec > 0 ? 'dec' : 'int')

function plain(kind: Kind, grade: Grade, level: Level, tables: number[]): Problem {
  const t = base(kind, grade, level, tables)
  return {
    text: `${expr(t)} = __`,
    kind,
    input: inputOf(t.dc),
    answer: fmt(t.c, t.dc),
    value: t.c / 10 ** t.dc
  }
}

function fill(kinds: Kind[], grade: Grade, level: Level, tables: number[]): Problem {
  const arithmetic = kinds.filter((k) => ['add', 'sub', 'mul', 'div'].includes(k))
  const pool = (arithmetic.length ? arithmetic : (['add', 'sub', 'mul', 'div'] as Kind[])).filter(
    (k) => kindAvailable(k, grade)
  )
  const t = base(pickOne(pool) ?? 'add', grade, level, tables)
  // Qué número falta: nunca el resultado (eso es la operación común)
  const hideA = randomInt(0, 1) === 0
  const hidden = hideA ? t.a : t.b
  const dec = hideA ? t.da : t.db
  return {
    text: `${hideA ? '__' : fmt(t.a, t.da)} ${t.op} ${hideA ? fmt(t.b, t.db) : '__'} = ${fmt(t.c, t.dc)}`,
    kind: 'fill',
    input: inputOf(dec),
    answer: fmt(hidden, dec),
    value: hidden / 10 ** dec
  }
}

/* ---------- Comparar ---------- */

const CMP_MAX: Record<Grade, number> = { 1: 99, 2: 999, 3: 9999, 4: 99999, 5: 1000, 6: 1000 }
const CMP_DEC: Record<Grade, 0 | 1 | 2> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 6: 2 }

const symbol = (a: number, b: number): '<' | '>' | '=' => (a < b ? '<' : a > b ? '>' : '=')

function cmpProblem(left: string, right: string, a: number, b: number): Problem {
  const sym = symbol(a, b)
  return { text: `${left} __ ${right}`, kind: 'cmp', input: 'cmp', answer: sym, sym }
}

/** Dos maneras de escribir v como suma */
function asSum(v: number, dec: number): string {
  const a = scaledInt(1, v - 1, dec)
  return `${fmt(a, dec)} + ${fmt(v - a, dec)}`
}

function cmp(grade: Grade, level: Level, tables: number[]): Problem {
  const equal = randomInt(1, 100) <= 22
  if (level === 1) {
    const dec = CMP_DEC[grade]
    const top = CMP_MAX[grade] * 10 ** dec
    const a = scaledInt(1, top, dec)
    let b: number
    if (equal) b = a
    else if (randomInt(0, 1) === 0) b = Math.max(1, a + randomInt(-9, 9))
    else b = scaledInt(1, top, dec)
    return cmpProblem(fmt(a, dec), fmt(b, dec), a, b)
  }
  const useMul = grade >= 2 && randomInt(0, 2) === 0
  const t = useMul
    ? genMul(Math.min(grade, 4) as Grade, 1, tables)
    : genAdd(grade, level === 3 ? 2 : 1)
  const leftText = expr(t)
  const v = t.c
  const target = equal
    ? v
    : Math.max(
        2,
        v + (randomInt(0, 1) === 0 ? -1 : 1) * randomInt(1, Math.max(2, Math.round(v * 0.1)))
      )
  if (level === 2) return cmpProblem(leftText, fmt(target, t.dc), v, target)
  return cmpProblem(leftText, asSum(target, t.dc), v, target)
}

/* ---------- Fracciones ---------- */

function fracProblem(grade: Grade, level: Level): Problem {
  const kind = ((): 'homo' | 'homoBig' | 'unit' | 'of' | 'hetM' | 'hetG' => {
    const table: Record<number, ('homo' | 'homoBig' | 'unit' | 'of' | 'hetM' | 'hetG')[]> = {
      4: ['unit', 'of', 'homo'],
      5: ['homo', 'homoBig', 'of'],
      6: ['homoBig', 'hetM', 'hetG']
    }
    return table[grade][level - 1]
  })()

  if (kind === 'unit' || kind === 'of') {
    // «2/2 de» no es una fracción propia: para «de» se usan denominadores desde 3
    const d = pickOne(kind === 'unit' ? [2, 3, 4, 5, 10] : [3, 4, 5, 10]) as number
    const n = kind === 'unit' ? 1 : randomInt(2, d - 1)
    const whole = d * randomInt(2, 12)
    const value = (whole / d) * n
    return {
      text: `${n}/${d} de ${whole} = __`,
      kind: 'frac',
      input: 'int',
      answer: String(value),
      value
    }
  }

  let d1: number
  let d2: number
  if (kind === 'homo' || kind === 'homoBig') {
    d1 = d2 = randomInt(3, 10)
  } else if (kind === 'hetM') {
    const pair = pickOne([
      [2, 4],
      [2, 6],
      [3, 6],
      [4, 8],
      [5, 10],
      [3, 9],
      [2, 8]
    ]) as number[]
    d1 = pair[0]
    d2 = pair[1]
  } else {
    const pair = pickOne([
      [2, 3],
      [3, 4],
      [2, 5],
      [3, 5],
      [4, 5],
      [2, 7],
      [3, 8]
    ]) as number[]
    d1 = pair[0]
    d2 = pair[1]
  }
  const common = (d1 * d2) / gcd(d1, d2)
  const subtract = randomInt(0, 1) === 0
  let n1 = randomInt(1, d1 - 1)
  let n2 = randomInt(1, d2 - 1)
  if (kind === 'homo') {
    // La suma se queda en una parte propia
    while (n1 + n2 >= d1) {
      n1 = randomInt(1, d1 - 1)
      n2 = randomInt(1, d2 - 1)
    }
  }
  let v1 = n1 * (common / d1)
  let v2 = n2 * (common / d2)
  let f1: [number, number] = [n1, d1]
  let f2: [number, number] = [n2, d2]
  if (subtract) {
    if (v1 === v2) {
      // Que no dé cero
      n1 = Math.min(d1 - 1, n1 + 1)
      v1 = n1 * (common / d1)
      f1 = [n1, d1]
    }
    if (v1 < v2) {
      ;[v1, v2] = [v2, v1]
      ;[f1, f2] = [f2, f1]
    }
    if (v1 === v2) {
      // Sigue igual (n1 era el máximo): se cambia el segundo
      f2 = [1, d2]
      v2 = common / d2
      if (v1 === v2) {
        f1 = [d1 - 1 || 1, d1]
        v1 = f1[0] * (common / d1)
      }
    }
  }
  const result = subtract ? v1 - v2 : v1 + v2
  const g = gcd(result, common)
  const rn = result / g
  const rd = common / g
  return {
    text: `${f1[0]}/${f1[1]} ${subtract ? '−' : '+'} ${f2[0]}/${f2[1]} = __`,
    kind: 'frac',
    input: 'frac',
    answer: rd === 1 ? String(rn) : `${rn}/${rd}`,
    value: rn / rd,
    frac: [rn, rd]
  }
}

/* ---------- Potencias y porcentajes (6.º) ---------- */

function powProblem(level: Level): Problem {
  let base: number
  let exp: number
  if (level === 1) {
    base = randomInt(2, 10)
    exp = 2
  } else if (level === 2) {
    if (randomInt(0, 1) === 0) {
      base = randomInt(11, 15)
      exp = 2
    } else {
      base = pickOne([2, 3, 4, 5, 10]) as number
      exp = 3
    }
  } else {
    const opt = pickOne([
      [2, randomInt(4, 10)],
      [3, randomInt(3, 5)],
      [5, 3],
      [10, randomInt(3, 6)],
      [4, 4]
    ]) as number[]
    base = opt[0]
    exp = opt[1]
  }
  const value = base ** exp
  return {
    text: `${base}${sup(exp)} = __`,
    kind: 'pow',
    input: 'int',
    answer: fmt(value, 0),
    value
  }
}

function pctProblem(level: Level): Problem {
  const options: Record<Level, number[]> = {
    1: [50, 10, 100, 25],
    2: [10, 20, 25, 50, 75],
    3: [5, 15, 30, 40, 60, 12]
  }
  const p = pickOne(options[level]) as number
  const unit = 100 / gcd(p, 100)
  const step = level === 3 ? unit : (unit * 10) / gcd(unit, 10)
  const max = level === 1 ? 200 : 500
  const whole =
    step * randomInt(Math.max(1, Math.ceil(20 / step)), Math.max(2, Math.floor(max / step)))
  const value = (whole * p) / 100
  return {
    text: `${p}${NBSP}% de ${whole} = __`,
    kind: 'pct',
    input: 'int',
    answer: String(value),
    value
  }
}

/** Una operación nueva según las opciones; intenta no repetir las últimas (`avoid`) */
export function makeProblem(config: Config, avoid: string[] = []): Problem {
  const { grade, level, tables } = config
  const kinds = config.kinds.filter((k) => kindAvailable(k, grade))
  const usable: Kind[] = kinds.length ? kinds : ['add', 'sub']
  let problem: Problem | null = null
  for (let i = 0; i < 12; i++) {
    const kind = pickOne(usable) as Kind
    switch (kind) {
      case 'fill':
        problem = fill(usable, grade, level, tables)
        break
      case 'cmp':
        problem = cmp(grade, level, tables)
        break
      case 'frac':
        problem = fracProblem(grade, level)
        break
      case 'pow':
        problem = powProblem(level)
        break
      case 'pct':
        problem = pctProblem(level)
        break
      default:
        problem = plain(kind, grade, level, tables)
    }
    if (!avoid.includes(problem.text)) break
  }
  return problem as Problem
}

/** ¿Lo escrito es la respuesta correcta? (acepta fracciones equivalentes, coma o punto decimal) */
export function checkAnswer(problem: Problem, typed: string): boolean {
  const text = typed.trim().replace(/\s/g, '')
  if (!text) return false
  if (problem.input === 'cmp') return text === problem.sym
  if (problem.input === 'frac' && problem.frac) {
    const m = /^(\d+)(?:\/(\d+))?$/.exec(text)
    if (!m) return false
    const n = Number(m[1])
    const d = Number(m[2] ?? 1)
    if (d === 0) return false
    return n * problem.frac[1] === problem.frac[0] * d
  }
  if (!/^\d+(?:[.,]\d+)?$/.test(text)) return false
  return Math.abs(Number(text.replace(',', '.')) - (problem.value ?? NaN)) < 1e-9
}

/** Una tanda de operaciones sin repetir las últimas */
export function makeSet(config: Config, count: number): Problem[] {
  const out: Problem[] = []
  for (let i = 0; i < count; i++) {
    out.push(
      makeProblem(
        config,
        out.slice(-8).map((p) => p.text)
      )
    )
  }
  return out
}
