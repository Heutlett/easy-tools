/** Ilustraciones hechas con emojis sobre un fondo de colores: no pesan nada y funcionan sin internet. */
export interface Scene {
  id: string
  name: string
  bg: string
  /** [emoji, x %, y % (centro), tamaño en % del ancho] */
  items: [string, number, number, number][]
}

const SKY = '#7dd3fc 0%, #bae6fd 54%'
export const SCENES: Scene[] = [
  {
    id: 'volcan',
    name: 'Volcán',
    bg: `linear-gradient(${SKY}, #86efac 54%, #22c55e 100%)`,
    items: [
      ['☀️', 80, 16, 20],
      ['☁️', 24, 18, 22],
      ['🌋', 50, 54, 54],
      ['🌴', 15, 76, 26],
      ['🌴', 86, 80, 22],
      ['🦋', 66, 88, 12]
    ]
  },
  {
    id: 'playa',
    name: 'Playa',
    bg: `linear-gradient(${SKY}, #38bdf8 54%, #0ea5e9 68%, #fde68a 68%, #fcd34d 100%)`,
    items: [
      ['☀️', 82, 14, 20],
      ['⛵', 30, 48, 22],
      ['🌴', 14, 74, 28],
      ['🐢', 58, 84, 24],
      ['🦀', 86, 88, 13],
      ['🐚', 34, 92, 11]
    ]
  },
  {
    id: 'selva',
    name: 'Selva',
    bg: 'linear-gradient(#bbf7d0 0%, #4ade80 55%, #15803d 100%)',
    items: [
      ['🌳', 17, 34, 34],
      ['🌳', 84, 30, 38],
      ['🦥', 50, 58, 42],
      ['🦋', 26, 82, 14],
      ['🐸', 80, 86, 15]
    ]
  },
  {
    id: 'mar',
    name: 'Fondo del mar',
    bg: 'linear-gradient(#7dd3fc 0%, #0ea5e9 45%, #075985 100%)',
    items: [
      ['🐬', 50, 40, 42],
      ['🐙', 22, 78, 22],
      ['🐠', 78, 70, 18],
      ['🐢', 68, 90, 16],
      ['🦀', 36, 92, 12],
      ['🐟', 20, 20, 14]
    ]
  },
  {
    id: 'finca',
    name: 'Finca',
    bg: `linear-gradient(${SKY}, #bef264 54%, #65a30d 100%)`,
    items: [
      ['☀️', 82, 14, 18],
      ['🏡', 26, 44, 34],
      ['🐄', 68, 66, 28],
      ['🐓', 28, 82, 16],
      ['🌾', 86, 88, 16],
      ['🐖', 50, 90, 14]
    ]
  },
  {
    id: 'escuela',
    name: 'Escuela',
    bg: `linear-gradient(${SKY}, #d1d5db 70%, #9ca3af 100%)`,
    items: [
      ['☁️', 20, 12, 18],
      ['☀️', 84, 14, 16],
      ['🏫', 50, 44, 46],
      ['🌳', 9, 62, 22],
      ['🌳', 91, 62, 22],
      ['🚌', 28, 84, 24],
      ['🚗', 76, 86, 18]
    ]
  },
  {
    id: 'frutas',
    name: 'Frutas',
    bg: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
    items: [
      ['🍍', 27, 27, 36],
      ['🍌', 73, 27, 32],
      ['🥭', 27, 73, 32],
      ['🍉', 73, 73, 34]
    ]
  },
  {
    id: 'espacio',
    name: 'Espacio',
    bg: 'linear-gradient(#1e1b4b 0%, #4c1d95 100%)',
    items: [
      ['⭐', 14, 14, 10],
      ['🌙', 84, 14, 14],
      ['🚀', 62, 36, 28],
      ['🌍', 28, 68, 34],
      ['🪐', 78, 78, 22],
      ['⭐', 52, 90, 8]
    ]
  },
  {
    id: 'cafe',
    name: 'Café',
    bg: 'linear-gradient(#fde68a 0%, #d97706 100%)',
    items: [
      ['☕', 50, 52, 58],
      ['🌱', 16, 82, 14],
      ['🌱', 86, 82, 14],
      ['☀️', 82, 16, 16]
    ]
  },
  {
    id: 'perezoso',
    name: 'Perezoso',
    bg: 'linear-gradient(#bbf7d0, #22c55e)',
    items: [['🦥', 50, 52, 66]]
  },
  {
    id: 'tortuga',
    name: 'Tortuga',
    bg: 'linear-gradient(#bae6fd, #0ea5e9)',
    items: [['🐢', 50, 52, 66]]
  },
  {
    id: 'delfin',
    name: 'Delfín',
    bg: 'linear-gradient(#e0f2fe, #38bdf8)',
    items: [['🐬', 50, 52, 66]]
  },
  {
    id: 'loro',
    name: 'Loro',
    bg: 'linear-gradient(#fef9c3, #a3e635)',
    items: [['🦜', 50, 52, 66]]
  },
  {
    id: 'mariposa',
    name: 'Mariposa',
    bg: 'linear-gradient(#fce7f3, #f9a8d4)',
    items: [['🦋', 50, 52, 66]]
  }
]

/** Lo que se dibuja en el rompecabezas: una ilustración o una imagen propia (url) */
export type Art = { scene: Scene } | { url: string }
