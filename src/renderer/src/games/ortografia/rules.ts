/** Reglas del programa de Español que se practican, en el orden en que se muestran */
export type RuleId =
  | 'abc'
  | 'silabas'
  | 'mayus'
  | 'signos'
  | 'rrr'
  | 'mp'
  | 'gu'
  | 'csz'
  | 'bv'
  | 'gj'
  | 'h'
  | 'lly'
  | 'x'
  | 'tilde'
  | 'diacritica'
  | 'confusion'

export interface Rule {
  id: RuleId
  title: string
  /** Resumen para el final: qué hay que recordar */
  summary: string
}

export const RULES: Rule[] = [
  { id: 'abc', title: 'Letras', summary: 'Las letras del abecedario y sus sonidos.' },
  {
    id: 'silabas',
    title: 'Sílabas',
    summary: 'Las palabras se separan en sílabas, o golpes de voz.'
  },
  {
    id: 'mayus',
    title: 'Mayúsculas',
    summary:
      'Llevan mayúscula la primera palabra de la oración, después de un punto y los nombres propios.'
  },
  {
    id: 'signos',
    title: 'Signos',
    summary:
      'Las preguntas y las exclamaciones se abren y se cierran (¿?, ¡!); la coma separa lo que se enumera; el punto cierra la oración.'
  },
  {
    id: 'rrr',
    title: 'r / rr',
    summary: 'Entre vocales, el sonido fuerte es rr; al principio de palabra se escribe una sola r.'
  },
  {
    id: 'mp',
    title: 'm / n',
    summary: 'Antes de p y de b se escribe m; antes de las demás letras, n.'
  },
  {
    id: 'gu',
    title: 'gue, gui, güe, güi, que, qui',
    summary: 'Con gue, gui, que y qui la u no suena; con diéresis (güe, güi) la u sí se pronuncia.'
  },
  {
    id: 'csz',
    title: 'c / s / z',
    summary:
      'Ce y ci se escriben con c; za, zo y zu con z; en Costa Rica suenan igual, hay que recordar la regla.'
  },
  {
    id: 'bv',
    title: 'b / v',
    summary: 'La b y la v suenan igual: hay que recordar la regla o la familia de palabras.'
  },
  {
    id: 'gj',
    title: 'g / j',
    summary: 'Ge y gi pueden ir con g o con j; ja, jo y ju siempre llevan j.'
  },
  {
    id: 'h',
    title: 'h',
    summary:
      'La h no suena, pero hay que escribirla: hue-, hie-, hum-, herm-, horm- y la familia de palabras.'
  },
  {
    id: 'lly',
    title: 'll / y',
    summary: 'La ll y la y suenan casi igual: -illo, -illa llevan ll; al final de palabra suena y.'
  },
  {
    id: 'x',
    title: 'x',
    summary:
      'Ex- antes de pr, pl, tr se escribe con x; las palabras de una misma familia conservan la x.'
  },
  {
    id: 'tilde',
    title: 'Tilde',
    summary:
      'Agudas: tilde si terminan en n, s o vocal. Graves: tilde si NO terminan en n, s o vocal. Esdrújulas: siempre. Hiato: tilde en la vocal cerrada fuerte.'
  },
  {
    id: 'diacritica',
    title: 'Tilde diacrítica',
    summary:
      'Algunas palabras iguales se distinguen con tilde: tú / tu, él / el, mí / mi, sí / si, té / te, más / mas, qué / que.'
  },
  {
    id: 'confusion',
    title: 'Palabras que se confunden',
    summary:
      'Hay palabras que suenan igual y se escriben distinto: hay / ahí / ay, a ver / haber, hacia / hacía…'
  }
]

export const ruleTitle = (id: RuleId): string => RULES.find((r) => r.id === id)?.title ?? id
export const ruleSummary = (id: RuleId): string => RULES.find((r) => r.id === id)?.summary ?? ''
