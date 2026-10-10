import type { Grade } from '../../content/types'
import { pick, pickOne, shuffle } from '../../lib/games/shuffle'
import { firstGrade, gapOk, tildeAmbiguous, wrongForms } from './data/computed'
import { pictureWords } from './data/grade1'
import { capsSentences, sentenceItems } from './data/sentences'
import { tildeWords, type StressClass } from './data/tilde'
import { wordGroups } from './data/words'
import type { RuleId } from './rules'

/** Un ejercicio listo para mostrar */
export interface Item {
  /** Palabra o frase base (no se repite en una partida) */
  key: string
  rule: RuleId
  /** Lo que se ve grande. __ marca el espacio por completar */
  prompt: string
  /** Instrucción corta sobre el enunciado */
  hint: string
  emoji?: string
  options: string[]
  answer: number
  /** Lo que se recuerda después de responder */
  why: string
  /** La forma correcta, para mostrarla completa */
  example: string
}

/** Un ejercicio posible: `make()` arma uno nuevo (opciones en orden al azar) cada vez */
export interface Entry {
  key: string
  rule: RuleId
  make: () => Item
}

const GAP_OPTIONS: Partial<Record<RuleId, string[]>> = {
  rrr: ['r', 'rr'],
  mp: ['m', 'n'],
  gu: ['gü', 'gu'],
  csz: ['c', 's', 'z'],
  bv: ['b', 'v'],
  gj: ['g', 'j'],
  h: ['h', ''],
  lly: ['ll', 'y'],
  x: ['x', 's']
}

const label = (o: string): string => (o === '' ? 'sin h' : o)
const MARK = /\{([^}]*)\}/
const stripAccents = (s: string): string =>
  s
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u')

const withAnswer = (options: string[], correct: string): { options: string[]; answer: number } => {
  const mixed = shuffle(options)
  return { options: mixed, answer: mixed.indexOf(correct) }
}

// ───────────────────────── palabras ─────────────────────────

function wordEntries(grade: Grade): Entry[] {
  const seen = new Set<string>()
  const entries: Entry[] = []
  for (const group of wordGroups) {
    if (group.grade !== grade) continue
    for (const raw of group.words) {
      const word = raw.replace(MARK, '$1')
      if (seen.has(word)) continue
      seen.add(word)
      const canGap = MARK.test(raw) && gapOk.includes(raw) && GAP_OPTIONS[group.rule]
      const all = wrongForms[word] ?? []
      // Para palabras sin tilde, mejor errores de letras que de tilde
      const plainOnes = all.filter((w) => !/[áéíóú]/.test(w) || /[áéíóú]/.test(word))
      const wrongs = plainOnes.length >= 3 ? plainOnes : all
      const canPick = wrongs.length >= 3
      if (!canGap && !canPick) continue
      entries.push({
        key: word,
        rule: group.rule,
        make: () => {
          const useGap = canGap && (!canPick || Math.random() < 0.5)
          if (useGap) {
            const opts = GAP_OPTIONS[group.rule] as string[]
            const correct = (MARK.exec(raw) as RegExpExecArray)[1]
            return {
              key: word,
              rule: group.rule,
              prompt: raw.replace(MARK, '__'),
              hint: 'Completa la palabra',
              options: opts.map(label),
              answer: opts.indexOf(correct),
              why: group.why,
              example: word
            }
          }
          const { options, answer } = withAnswer([word, ...pick(wrongs, 3)], word)
          return {
            key: word,
            rule: group.rule,
            prompt: '',
            hint: '¿Cuál está bien escrita?',
            options,
            answer,
            why: group.why,
            example: word
          }
        }
      })
    }
  }
  return entries
}

// ───────────────────────── tilde ─────────────────────────

const CLASS_LABEL: Record<StressClass, string> = {
  a: 'Aguda',
  g: 'Grave',
  e: 'Esdrújula',
  s: 'Sobresdrújula',
  h: 'Hiato',
  d: 'Diptongo'
}

function tildeWhy(word: string, kind: StressClass): string {
  const has = /[áéíóú]/.test(word)
  const last = stripAccents(word.toLowerCase()).slice(-1)
  const end = /[aeiou]/.test(last) ? 'vocal' : `«${last}»`
  switch (kind) {
    case 'a':
      return has
        ? `«${word}» es aguda (suena más fuerte la última sílaba) y termina en ${end}: las agudas llevan tilde cuando terminan en n, s o vocal.`
        : `«${word}» es aguda, pero termina en ${end}: las agudas solo llevan tilde si terminan en n, s o vocal.`
    case 'g':
      return has
        ? `«${word}» es grave (suena más fuerte la penúltima sílaba) y termina en ${end}: las graves llevan tilde cuando NO terminan en n, s o vocal.`
        : `«${word}» es grave y termina en ${end}: las graves no llevan tilde si terminan en n, s o vocal.`
    case 'e':
      return `«${word}» es esdrújula (suena más fuerte la antepenúltima sílaba): todas las esdrújulas llevan tilde.`
    case 's':
      return `«${word}» es sobresdrújula: todas las sobresdrújulas llevan tilde.`
    case 'h':
      return `«${word}» lleva tilde porque tiene un hiato: la vocal cerrada (i, u) se pronuncia fuerte y separa las sílabas.`
    default:
      return `«${word}» no lleva tilde: tiene un diptongo (dos vocales en una misma sílaba).`
  }
}

function tildeEntries(grade: Grade): Entry[] {
  const seen = new Set<string>()
  const entries: Entry[] = []
  for (const t of tildeWords) {
    if (t.grade !== grade) continue
    const word = t.word
    const lower = word.toLowerCase()
    if (seen.has(lower)) continue
    seen.add(lower)
    const has = /[áéíóú]/.test(lower)
    const wrongs = wrongForms[`t:${word}`] ?? []
    const makers: (() => Item)[] = []
    const base = {
      key: lower,
      rule: 'tilde' as const,
      why: tildeWhy(word, t.kind),
      example: word
    }
    if (!tildeAmbiguous.includes(word)) {
      const shown = has ? stripAccents(word) : word
      makers.push(() => ({
        ...base,
        prompt: shown,
        hint: '¿Esta palabra lleva tilde?',
        options: ['Sí lleva tilde', 'No lleva tilde'],
        answer: has ? 0 : 1
      }))
    }
    if (wrongs.length >= 3)
      makers.push(() => {
        const { options, answer } = withAnswer([word, ...pick(wrongs, 3)], word)
        return { ...base, prompt: '', hint: '¿Cuál está bien escrita?', options, answer }
      })
    if (['a', 'g', 'e', 's'].includes(t.kind)) {
      makers.push(() => {
        const labels = grade >= 6 || t.kind === 's' ? ['a', 'g', 'e', 's'] : ['a', 'g', 'e']
        return {
          ...base,
          prompt: word,
          hint: '¿Qué clase de palabra es?',
          options: labels.map((k) => CLASS_LABEL[k as StressClass]),
          answer: labels.indexOf(t.kind),
          why: tildeWhy(word, t.kind)
        }
      })
    }
    if (makers.length === 0) continue
    entries.push({ key: lower, rule: 'tilde', make: () => (pickOne(makers) as () => Item)() })
  }
  return entries
}

// ───────────────────────── frases a mano ─────────────────────────

function sentenceEntries(grade: Grade): Entry[] {
  return sentenceItems
    .filter((s) => s.grade === grade)
    .map((s, i) => ({
      key: `s${grade}-${i}-${s.options[0]}`,
      rule: s.rule,
      make: (): Item => {
        const { options, answer } = withAnswer(s.options, s.options[0])
        return {
          key: s.options[0],
          rule: s.rule,
          prompt: s.prompt.replace('___', '__'),
          hint: s.prompt ? 'Completa la oración' : '¿Cuál está bien escrita?',
          options,
          answer,
          why: s.why,
          example: s.prompt ? s.prompt.replace('___', s.options[0]) : s.options[0]
        }
      }
    }))
}

// ───────────────────────── mayúsculas ─────────────────────────

const TOKEN = /\{([^}]+)\}|\[([^\]]+)\]/g

function capsEntries(grade: Grade): Entry[] {
  return capsSentences
    .filter((c) => c.grade === grade)
    .map((c) => {
      // Piezas del texto: fijas, o «sitios» que se pueden escribir mal
      const parts: { text: string; site?: 'cap' | 'low' | 'start' }[] = []
      let last = 0
      let m: RegExpExecArray | null
      const proper: string[] = []
      const common: string[] = []
      TOKEN.lastIndex = 0
      while ((m = TOKEN.exec(c.text))) {
        if (m.index > last) parts.push({ text: c.text.slice(last, m.index) })
        if (m[1]) {
          parts.push({ text: m[1], site: 'cap' })
          proper.push(m[1])
        } else {
          parts.push({ text: m[2], site: 'low' })
          common.push(m[2])
        }
        last = m.index + m[0].length
      }
      if (last < c.text.length) parts.push({ text: c.text.slice(last) })
      if (parts[0] && !parts[0].site) {
        // La primera letra de la oración es un sitio más
        const first = parts[0].text
        parts.splice(0, 1, { text: first[0], site: 'start' }, { text: first.slice(1) })
      }
      const sites = parts.map((p, i) => (p.site ? i : -1)).filter((i) => i >= 0)
      const correct = parts.map((p) => p.text).join('')
      const lowerWords = (s: string): string =>
        s.replace(/(^|\s)(\S)/g, (_, a, b) => a + b.toLowerCase())
      const render = (mask: number): string =>
        parts
          .map((p, i) => {
            const bit = sites.indexOf(i)
            const on = bit >= 0 && (mask & (1 << bit)) !== 0
            if (!on) return p.text
            if (p.site === 'low') return p.text[0].toUpperCase() + p.text.slice(1)
            return lowerWords(p.text)
          })
          .join('')
      const masks: number[] = []
      for (let mask = 1; mask < 1 << sites.length; mask++) masks.push(mask)
      const bits = (n: number): number => n.toString(2).replace(/0/g, '').length
      const why = [
        'Llevan mayúscula el comienzo de la oración y los nombres propios' +
          (proper.length ? ` (${proper.join(', ')}).` : '.'),
        common.length
          ? `Los nombres comunes, los días, los meses y los idiomas van con minúscula (${common.join(', ')}).`
          : ''
      ]
        .filter(Boolean)
        .join(' ')
      return {
        key: `c${grade}-${c.text}`,
        rule: 'mayus' as const,
        make: (): Item => {
          const few = masks.filter((k) => bits(k) <= 2)
          const wrong = pick(few.length >= 3 ? few : masks, 3).map(render)
          const { options, answer } = withAnswer([correct, ...wrong], correct)
          return {
            key: correct,
            rule: 'mayus',
            prompt: '',
            hint: '¿Cuál está bien escrita?',
            options,
            answer,
            why,
            example: correct
          }
        }
      }
    })
}

// ───────────────────────── 1.º ─────────────────────────

const ALPHABET = 'abcdefghijklmnñopqrstuvwxyz'.split('')

function firstGradeEntries(): Entry[] {
  const entries: Entry[] = []
  for (const p of pictureWords) {
    const data = firstGrade[p.word]
    if (!data) continue
    const makers: (() => Item)[] = []
    const common = { key: p.word, emoji: p.emoji, example: p.word }
    const syl = p.syllables.join('-')
    if (data.ini.length >= 3)
      makers.push(() => {
        const { options, answer } = withAnswer([p.word[0], ...pick(data.ini, 3)], p.word[0])
        return {
          ...common,
          rule: 'abc',
          prompt: `__${p.word.slice(1)}`,
          hint: '¿Con qué letra empieza?',
          options,
          answer,
          why: `${p.word} empieza con la letra «${p.word[0]}».`
        }
      })
    p.syllables.forEach((s, idx) => {
      const wrongs = data.sil[idx] ?? []
      if (p.syllables.length < 2 || wrongs.length < 3) return
      makers.push(() => {
        const { options, answer } = withAnswer([s, ...pick(wrongs, 3)], s)
        return {
          ...common,
          rule: 'silabas',
          prompt: p.syllables.map((x, j) => (j === idx ? '__' : x)).join('-'),
          hint: '¿Qué sílaba falta?',
          options,
          answer,
          why: `${syl}: la palabra es «${p.word}».`
        }
      })
    })
    for (const [pos, alts] of Object.entries(data.voc)) {
      const i = Number(pos)
      makers.push(() => {
        const { options, answer } = withAnswer([p.word[i], ...pick(alts, 3)], p.word[i])
        return {
          ...common,
          rule: 'abc',
          prompt: p.word.slice(0, i) + '__' + p.word.slice(i + 1),
          hint: '¿Qué vocal falta?',
          options,
          answer,
          why: `La palabra es «${p.word}».`
        }
      })
    }
    if (p.syllables.length <= 4)
      makers.push(() => ({
        ...common,
        rule: 'silabas',
        prompt: p.word,
        hint: '¿Cuántas sílabas tiene? Da una palmada por cada una',
        options: ['1', '2', '3', '4'],
        answer: p.syllables.length - 1,
        why: `${syl}: ${p.syllables.length === 1 ? 'una sílaba' : `${p.syllables.length} sílabas`}.`
      }))
    entries.push({
      key: p.word,
      rule: 'silabas',
      make: () => (pickOne(makers) as () => Item)()
    })
  }

  // «¿Cuál palabra empieza con la sílaba…?»
  const firstSyllables = [...new Set(pictureWords.map((p) => p.syllables[0]))].filter(
    (s) => s.length >= 2 && pictureWords.filter((p) => p.syllables[0] === s).length >= 1
  )
  for (const s of firstSyllables) {
    const withIt = pictureWords.filter((p) => p.word.startsWith(s) && p.syllables.length > 1)
    const without = pictureWords.filter((p) => !p.word.startsWith(s[0]))
    if (withIt.length === 0 || without.length < 3) continue
    entries.push({
      key: `empieza-${s}`,
      rule: 'silabas',
      make: () => {
        const right = pickOne(withIt) as (typeof withIt)[number]
        const wrong = pick(without, 3)
        const show = (w: { emoji: string; word: string }): string => `${w.emoji} ${w.word}`
        const { options, answer } = withAnswer([right, ...wrong].map(show), show(right))
        return {
          key: `empieza-${s}`,
          rule: 'silabas',
          prompt: s,
          hint: '¿Qué palabra empieza con esta sílaba?',
          options,
          answer,
          why: `${right.syllables.join('-')} empieza con «${s}».`,
          example: right.word
        }
      }
    })
  }

  // Abecedario y vocales
  for (let i = 0; i < ALPHABET.length - 1; i++) {
    const cur = ALPHABET[i]
    const next = ALPHABET[i + 1]
    entries.push({
      key: `abc-${cur}`,
      rule: 'abc',
      make: () => {
        const others = shuffle(ALPHABET.filter((l) => l !== next && l !== cur)).slice(0, 3)
        const { options, answer } = withAnswer([next, ...others], next)
        return {
          key: `abc-${cur}`,
          rule: 'abc',
          prompt: `${cur}  →  __`,
          hint: `¿Qué letra sigue después de la «${cur}»?`,
          options,
          answer,
          why: `En el abecedario, después de la «${cur}» viene la «${next}».`,
          example: next
        }
      }
    })
  }
  for (const v of 'aeiou') {
    entries.push({
      key: `vocal-${v}`,
      rule: 'abc',
      make: () => {
        const cons = pick('bcdfgjlmnprstv'.split(''), 3)
        const { options, answer } = withAnswer([v, ...cons], v)
        return {
          key: `vocal-${v}`,
          rule: 'abc',
          prompt: '¿Cuál es vocal?',
          hint: 'Las vocales son a, e, i, o, u',
          options,
          answer,
          why: 'Las vocales son: a, e, i, o, u.',
          example: v
        }
      }
    })
  }
  return entries
}

// ───────────────────────── banco por grado ─────────────────────────

const cache = new Map<Grade, Entry[]>()

/** Todos los ejercicios posibles del grado (sin repetir la palabra base) */
export function bankFor(grade: Grade): Entry[] {
  const cached = cache.get(grade)
  if (cached) return cached
  const all =
    grade === 1
      ? [...firstGradeEntries(), ...capsEntries(1)]
      : [
          ...wordEntries(grade),
          ...tildeEntries(grade),
          ...sentenceEntries(grade),
          ...capsEntries(grade)
        ]
  const seen = new Set<string>()
  const bank = all.filter((e) => (seen.has(e.key) ? false : (seen.add(e.key), true)))
  cache.set(grade, bank)
  return bank
}

/** Reglas que tienen ejercicios en el grado, con su cantidad */
export function rulesIn(grade: Grade): { rule: RuleId; count: number }[] {
  const counts = new Map<RuleId, number>()
  for (const e of bankFor(grade)) counts.set(e.rule, (counts.get(e.rule) ?? 0) + 1)
  return [...counts].map(([rule, count]) => ({ rule, count }))
}

/** Arma una partida: `count` ejercicios distintos de las reglas elegidas, mezclando las reglas */
export function buildRound(grade: Grade, rules: RuleId[], count: number): Item[] {
  const pool = bankFor(grade).filter((e) => rules.includes(e.rule))
  return pick(pool, count).map((e) => e.make())
}
