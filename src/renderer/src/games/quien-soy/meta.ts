import type { GameMeta } from '../types'

export default {
  title: '¿Quién soy?',
  description:
    'Se descubre una pista a la vez sobre un animal, lugar o personaje: ¡mientras antes adivinen, más puntos!',
  icon: '🕵️‍♂️',
  type: 'palabras',
  subjects: ['ciencias', 'sociales', 'cultura'],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['clase', 'equipos'],
  keywords: ['pistas', 'adivina', 'adivinanza', 'animales', 'lugares'],
  order: 21
} satisfies GameMeta
