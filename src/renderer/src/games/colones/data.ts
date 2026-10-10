/*
 * Monedas y billetes de colones — alineado con los Programas de Estudio de Matemáticas del MEP (2012), área de Medidas, tema «Moneda»:
 *  - 1.º: construir la noción de unidad monetaria, el colón y la relación entre monedas de denominaciones hasta ₡100.
 *  - 2.º: relación entre monedas de denominaciones hasta ₡500, estimar y comparar cantidades monetarias.
 *  - 3.º: relación entre monedas hasta ₡500 y billetes de hasta ₡10 000; estimar y comparar cantidades.
 *  - 4.º: relación bancaria entre las monedas y billetes de todas las denominaciones («¿cuántas monedas de ₡500 se necesitan
 *         para tener ₡10 000?»); aplicar cantidades monetarias en situaciones reales o ficticias.
 *  - 5.º: aplicar el sistema monetario nacional en situaciones del entorno (compras con precios en colones).
 * Notación del programa: ₡12 500 (sin espacio en números de cuatro cifras: ₡2500).
 *
 * Dinero en circulación según el Banco Central de Costa Rica (bccr.fi.cr, consultado en 2026):
 *  - Monedas: ₡10, ₡25, ₡50, ₡100 y ₡500 (familia nueva, más pequeña). La de ₡5 dejó de acuñarse en 2020 y, junto con las
 *    de ₡10 y ₡25 del diseño anterior, perdió su valor como medio de pago el 1.º de julio de 2026 (BCCR), por eso el juego no
 *    la usa (los montos que se piden siempre se pueden formar con las piezas disponibles).
 *  - Billetes de polímero: ₡1000, ₡2000, ₡5000, ₡10 000 y ₡20 000. El billete de ₡50 000 de papel salió de circulación en 2022
 *    y no existe en polímero, por eso no se incluye.
 * Los dibujos son estilizados (círculos y rectángulos de colores con la denominación), no copian los diseños oficiales.
 */

export interface Denom {
  value: number
  kind: 'coin' | 'bill'
  /** Colores del dibujo */
  fill: string
  rim: string
  ink: string
  /** Diámetro de la moneda en el dibujo (relativo; crece con el valor) */
  size?: number
  /** Adorno del billete */
  emoji?: string
  name: string
}

export const COINS: Denom[] = [
  {
    value: 10,
    kind: 'coin',
    fill: '#d08a4e',
    rim: '#8a4a1c',
    ink: '#3b1d07',
    size: 0.62,
    name: 'moneda'
  },
  {
    value: 25,
    kind: 'coin',
    fill: '#d4d8de',
    rim: '#7b8494',
    ink: '#1f2933',
    size: 0.7,
    name: 'moneda'
  },
  {
    value: 50,
    kind: 'coin',
    fill: '#e8c04a',
    rim: '#a16207',
    ink: '#3b2a05',
    size: 0.78,
    name: 'moneda'
  },
  {
    value: 100,
    kind: 'coin',
    fill: '#e6ebf1',
    rim: '#8e9bb0',
    ink: '#1f2933',
    size: 0.86,
    name: 'moneda'
  },
  {
    value: 500,
    kind: 'coin',
    fill: '#eceff3',
    rim: '#d4a017',
    ink: '#1f2933',
    size: 1,
    name: 'moneda'
  }
]

export const BILLS: Denom[] = [
  {
    value: 1000,
    kind: 'bill',
    fill: '#fecaca',
    rim: '#dc2626',
    ink: '#7f1d1d',
    emoji: '🌿',
    name: 'billete'
  },
  {
    value: 2000,
    kind: 'bill',
    fill: '#bfdbfe',
    rim: '#2563eb',
    ink: '#1e3a8a',
    emoji: '🦋',
    name: 'billete'
  },
  {
    value: 5000,
    kind: 'bill',
    fill: '#fef08a',
    rim: '#ca8a04',
    ink: '#713f12',
    emoji: '🐸',
    name: 'billete'
  },
  {
    value: 10000,
    kind: 'bill',
    fill: '#bbf7d0',
    rim: '#16a34a',
    ink: '#14532d',
    emoji: '🦜',
    name: 'billete'
  },
  {
    value: 20000,
    kind: 'bill',
    fill: '#fed7aa',
    rim: '#ea580c',
    ink: '#7c2d12',
    emoji: '🐆',
    name: 'billete'
  }
]

export const ALL: Denom[] = [...COINS, ...BILLS]
export const denomOf = (value: number): Denom => ALL.find((d) => d.value === value) ?? ALL[0]

/** ₡12 500 (con espacio fino de miles desde cinco cifras) y ₡2500 (sin espacio en cuatro cifras), como en el programa del MEP */
export function money(n: number): string {
  const s = String(Math.abs(n))
  const body = n >= 10000 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : s
  return `${n < 0 ? '-' : ''}₡${body}`
}

export interface MoneyLevel {
  id: 1 | 2 | 3 | 4
  title: string
  grade: string
  /** Valores que se pueden usar */
  denoms: number[]
  /** Monto máximo y cuántas piezas tendrá el monto que se pide */
  max: number
  pieces: [number, number]
  /** Se muestra la suma mientras se arma */
  help: boolean
}

export const MONEY_LEVELS: MoneyLevel[] = [
  {
    id: 1,
    title: 'Monedas hasta ₡100',
    grade: '1.º',
    denoms: [10, 25, 50, 100],
    max: 100,
    pieces: [2, 4],
    help: true
  },
  {
    id: 2,
    title: 'Monedas hasta ₡500',
    grade: '2.º',
    denoms: [10, 25, 50, 100, 500],
    max: 1000,
    pieces: [2, 5],
    help: true
  },
  {
    id: 3,
    title: 'Con billetes hasta ₡10 000',
    grade: '3.º',
    denoms: [10, 25, 50, 100, 500, 1000, 2000, 5000, 10000],
    max: 10000,
    pieces: [3, 6],
    help: false
  },
  {
    id: 4,
    title: 'Todo el dinero',
    grade: '4.º',
    denoms: [10, 25, 50, 100, 500, 1000, 2000, 5000, 10000, 20000],
    max: 50000,
    pieces: [3, 7],
    help: false
  }
]
export const levelOf = (id: number): MoneyLevel =>
  MONEY_LEVELS.find((l) => l.id === id) ?? MONEY_LEVELS[0]

export interface StoreItem {
  emoji: string
  name: string
  price: number
}

/** Precios de ejemplo (redondeados a múltiplos de ₡50 para poder dar el vuelto exacto con monedas y billetes) */
export const STORES: Record<
  'pulperia' | 'feria',
  { title: string; icon: string; items: StoreItem[] }
> = {
  pulperia: {
    title: 'La pulpería',
    icon: '🏪',
    items: [
      { emoji: '🥛', name: 'leche', price: 1100 },
      { emoji: '🍞', name: 'pan', price: 1500 },
      { emoji: '🥚', name: 'cartón de huevos', price: 3500 },
      { emoji: '🍚', name: 'arroz', price: 1250 },
      { emoji: '🧃', name: 'jugo', price: 800 },
      { emoji: '🍪', name: 'galletas', price: 650 },
      { emoji: '🧀', name: 'queso', price: 2500 },
      { emoji: '🍫', name: 'chocolate', price: 1000 },
      { emoji: '🥫', name: 'atún', price: 1300 },
      { emoji: '🍬', name: 'confites', price: 300 },
      { emoji: '🧼', name: 'jabón', price: 700 },
      { emoji: '☕', name: 'café', price: 3200 }
    ]
  },
  feria: {
    title: 'La feria del agricultor',
    icon: '🥭',
    items: [
      { emoji: '🍍', name: 'piña', price: 1500 },
      { emoji: '🍉', name: 'sandía', price: 3500 },
      { emoji: '🥭', name: 'mango', price: 300 },
      { emoji: '🥑', name: 'aguacate', price: 600 },
      { emoji: '🍅', name: 'tomate', price: 250 },
      { emoji: '🥕', name: 'zanahoria', price: 200 },
      { emoji: '🌽', name: 'elote', price: 400 },
      { emoji: '🥬', name: 'lechuga', price: 800 },
      { emoji: '🍋', name: 'limón', price: 100 },
      { emoji: '🍌', name: 'plátano', price: 350 },
      { emoji: '🥥', name: 'coco', price: 1000 },
      { emoji: '🍊', name: 'naranja', price: 150 }
    ]
  }
}

/** Pares (billete o moneda grande, pieza pequeña) para «Cambio»: la grande se puede cambiar por piezas exactas de la chica */
export const CHANGE_PAIRS: { big: number; small: number; level: 2 | 3 | 4 }[] = [
  { big: 50, small: 25, level: 2 },
  { big: 50, small: 10, level: 2 },
  { big: 100, small: 50, level: 2 },
  { big: 100, small: 25, level: 2 },
  { big: 100, small: 10, level: 2 },
  { big: 500, small: 100, level: 2 },
  { big: 500, small: 50, level: 2 },
  { big: 500, small: 25, level: 2 },
  { big: 1000, small: 500, level: 3 },
  { big: 1000, small: 100, level: 3 },
  { big: 1000, small: 50, level: 3 },
  { big: 2000, small: 1000, level: 3 },
  { big: 2000, small: 500, level: 3 },
  { big: 5000, small: 1000, level: 3 },
  { big: 5000, small: 500, level: 3 },
  { big: 10000, small: 1000, level: 3 },
  { big: 10000, small: 5000, level: 3 },
  { big: 10000, small: 2000, level: 3 },
  { big: 10000, small: 500, level: 4 },
  { big: 5000, small: 100, level: 4 },
  { big: 10000, small: 100, level: 4 },
  { big: 20000, small: 10000, level: 4 },
  { big: 20000, small: 5000, level: 4 },
  { big: 20000, small: 2000, level: 4 },
  { big: 20000, small: 1000, level: 4 }
]
