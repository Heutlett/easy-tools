import type { GameMeta } from '../types'

export default {
  title: 'Imagen escondida',
  description:
    'Una imagen tapada por cuadros que se van quitando: la clase adivina qué es. Mientras menos cuadros, más puntos.',
  icon: '🕵️',
  color: '#0d9488',
  subjects: ['matematica', 'espanol', 'ciencias', 'sociales', 'ingles', 'musica', 'cultura'],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['clase', 'equipos', 'turnos'],
  keywords: [
    'adivinar',
    'misterio',
    'imagen',
    'cuadros',
    'emoji',
    'dibujo',
    'detective',
    'vocabulario',
    'animales',
    'frutas',
    'oficios',
    'foto'
  ],
  order: 40
} satisfies GameMeta
