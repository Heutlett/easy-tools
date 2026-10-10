import type { Grade } from '../../content/types'

/*
 * Mapa por GRADO de lo que genera «Cálculo mental relámpago».
 *
 * Fuente: Programas de Estudio de Matemáticas del MEP (2012), documento curricular para primaria, y su
 * orientación metodológica:
 *  - I ciclo (1.º a 3.º): el cálculo mental es fundamental («tablas de suma, sumar 2, sumar 10, sumar 9…») y se
 *    trabaja como juego; adición y sustracción desde 1.º; «el aprendizaje de las tablas de multiplicación se
 *    inicia en 2.º Año»; la división aparece como operación inversa de la multiplicación (en este juego, en 2.º se
 *    practica con «completar»: 3 × __ = 12; la división propiamente dicha se ofrece desde 3.º).
 *  - Los números crecen así: 1.º hasta 99, 2.º hasta 999, 3.º hasta 9 999, 4.º hasta 999 999 («números menores que
 *    1 000 000»).
 *  - II ciclo (4.º a 6.º): se afianzan las cuatro operaciones con números grandes y se introducen las fracciones
 *    (4.º: solo fracciones propias; 5.º: impropias y mixtas; 6.º: suma y resta de fracciones homogéneas y heterogéneas),
 *    los decimales (el programa los introduce en 4.º; aquí las operaciones con decimales empiezan en 5.º, con coma
 *    decimal como en Costa Rica), y las potencias y el porcentaje (6.º). Por eso en 4.º y 5.º las fracciones se limitan
 *    a «fracción de una cantidad» y, con prudencia, sumas de fracciones con igual denominador.
 * Los topes numéricos exactos de cada nivel de dificultad son una adaptación pedagógica para cálculo mental,
 * pensada para que «Fácil» sea claramente fácil dentro del grado y «Difícil» exija esfuerzo.
 *
 *   Grado | Operaciones         | Fácil                  | Media                    | Difícil
 *   1.º   | + − comparar completar | sumas hasta 10      | hasta 20                 | hasta 99
 *   2.º   | + − × (tablas 2,3,4,5,10) | hasta 100 · ×2 a 5 | hasta 500 · ×2 a 10    | hasta 999 · ×6 a 10
 *   3.º   | + − × ÷ (tablas 2 a 10)  | hasta 1 000 · ×2 a 10 | hasta 5 000 · ×2 a 12 | hasta 9 999 · ×11 a 99
 *   4.º   | + − × ÷, fracciones      | hasta 10 000 · ×2 a 12 | hasta 99 999 · ×11 a 99 | hasta 999 999 · ×100 a 999
 *   5.º   | idem + decimales         | hasta 999 999 · ×11 a 99 | decimales (1 cifra) · ×100 a 999 | decimales (2 cifras) · ×1,1 a 19,9
 *   6.º   | idem + potencias, %      | decimales (1 cifra) hasta 100 | decimales (2 cifras) hasta 1 000 | decimales (2 cifras) hasta 10 000
 *         (factor: ×100 a 999)    (factor: ×1,1 a 19,9)         (factor: ×1,01 a 9,99)
 */

/** Espacio que no se parte (separa miles y el %) */
export const NBSP = String.fromCharCode(160)

export type Level = 1 | 2 | 3

export type Kind = 'add' | 'sub' | 'mul' | 'div' | 'fill' | 'cmp' | 'frac' | 'pow' | 'pct'

export interface KindInfo {
  id: Kind
  title: string
  icon: string
  /** Primer grado en que se ofrece */
  from: Grade
  /** Último grado en que se ofrece */
  to: Grade
}

export const KINDS: KindInfo[] = [
  { id: 'add', title: 'Sumas', icon: '➕', from: 1, to: 6 },
  { id: 'sub', title: 'Restas', icon: '➖', from: 1, to: 6 },
  { id: 'mul', title: 'Multiplicaciones', icon: '✖️', from: 2, to: 6 },
  { id: 'div', title: 'Divisiones', icon: '➗', from: 3, to: 6 },
  { id: 'fill', title: 'Completar', icon: '❓', from: 1, to: 6 },
  { id: 'cmp', title: 'Comparar', icon: '⚖️', from: 1, to: 6 },
  { id: 'frac', title: 'Fracciones', icon: '🍕', from: 4, to: 6 },
  { id: 'pow', title: 'Potencias', icon: '⬆️', from: 6, to: 6 },
  { id: 'pct', title: 'Porcentajes', icon: '％', from: 6, to: 6 }
]

export const kindAvailable = (k: Kind, grade: Grade): boolean => {
  const info = KINDS.find((x) => x.id === k)
  return !!info && grade >= info.from && grade <= info.to
}

export const LEVELS: { id: Level; title: string; icon: string }[] = [
  { id: 1, title: 'Fácil', icon: '🌱' },
  { id: 2, title: 'Media', icon: '🌿' },
  { id: 3, title: 'Difícil', icon: '🌳' }
]

/** Operaciones que se activan al elegir un grado */
export const DEFAULT_KINDS: Record<Grade, Kind[]> = {
  1: ['add', 'sub'],
  2: ['add', 'sub', 'mul'],
  3: ['add', 'sub', 'mul', 'div'],
  4: ['add', 'sub', 'mul', 'div'],
  5: ['add', 'sub', 'mul', 'div', 'frac'],
  6: ['add', 'sub', 'mul', 'div', 'frac']
}

/** Tablas que se activan al elegir un grado (el programa empieza con 2, 3, 4, 5 y 10 en 2.º) */
export const DEFAULT_TABLES: Record<Grade, number[]> = {
  1: [],
  2: [2, 3, 4, 5, 10],
  3: [2, 3, 4, 5, 6, 7, 8, 9, 10],
  4: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  5: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  6: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
}

export const ALL_TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

/** Sumas y restas: tope del total (en unidades enteras) y cifras decimales, por grado y dificultad */
export interface AddSpec {
  max: number
  dec: 0 | 1 | 2
}
export const ADD_SPECS: Record<Grade, [AddSpec, AddSpec, AddSpec]> = {
  1: [
    { max: 10, dec: 0 },
    { max: 20, dec: 0 },
    { max: 99, dec: 0 }
  ],
  2: [
    { max: 100, dec: 0 },
    { max: 500, dec: 0 },
    { max: 999, dec: 0 }
  ],
  3: [
    { max: 1000, dec: 0 },
    { max: 5000, dec: 0 },
    { max: 9999, dec: 0 }
  ],
  4: [
    { max: 10000, dec: 0 },
    { max: 99999, dec: 0 },
    { max: 999999, dec: 0 }
  ],
  5: [
    { max: 999999, dec: 0 },
    { max: 100, dec: 1 },
    { max: 1000, dec: 2 }
  ],
  6: [
    { max: 100, dec: 1 },
    { max: 1000, dec: 2 },
    { max: 10000, dec: 2 }
  ]
}

/** Multiplicaciones y divisiones: el otro factor (o el cociente) va de lo a hi; con decimales se cuenta en unidades de 0,1 o 0,01 */
export interface FactorSpec {
  lo: number
  hi: number
  dec: 0 | 1 | 2
}
export const MUL_SPECS: Record<Grade, [FactorSpec, FactorSpec, FactorSpec]> = {
  1: [
    { lo: 2, hi: 5, dec: 0 },
    { lo: 2, hi: 5, dec: 0 },
    { lo: 2, hi: 5, dec: 0 }
  ],
  2: [
    { lo: 2, hi: 5, dec: 0 },
    { lo: 2, hi: 10, dec: 0 },
    { lo: 6, hi: 10, dec: 0 }
  ],
  3: [
    { lo: 2, hi: 10, dec: 0 },
    { lo: 2, hi: 12, dec: 0 },
    { lo: 11, hi: 99, dec: 0 }
  ],
  4: [
    { lo: 2, hi: 12, dec: 0 },
    { lo: 11, hi: 99, dec: 0 },
    { lo: 100, hi: 999, dec: 0 }
  ],
  5: [
    { lo: 11, hi: 99, dec: 0 },
    { lo: 100, hi: 999, dec: 0 },
    { lo: 11, hi: 199, dec: 1 }
  ],
  6: [
    { lo: 100, hi: 999, dec: 0 },
    { lo: 11, hi: 199, dec: 1 },
    { lo: 101, hi: 999, dec: 2 }
  ]
}
export const DIV_SPECS = MUL_SPECS

/** Ritmo de la cuenta regresiva, en segundos */
export const SECONDS = [5, 10, 15, 30]
export const COUNTS = [10, 20, 30]
export const SOLO_SECONDS = [0, 10, 20, 30]

export interface Config {
  grade: Grade
  level: Level
  kinds: Kind[]
  tables: number[]
}

export type InputType = 'int' | 'dec' | 'frac' | 'cmp'

export interface Problem {
  /** Texto con «__» donde va la respuesta */
  text: string
  kind: Kind
  input: InputType
  /** Respuesta ya escrita para mostrar (coma decimal, fracción a/b, símbolo) */
  answer: string
  /** Valor numérico de la respuesta (para validar enteros y decimales) */
  value?: number
  /** Fracción de la respuesta: numerador y denominador */
  frac?: [number, number]
  /** Símbolo correcto al comparar */
  sym?: '<' | '>' | '='
}
