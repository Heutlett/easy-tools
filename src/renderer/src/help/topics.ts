import { getDurable } from '../lib/durable'
import type { RankingData } from '../lib/games/ranking'

export type HelpGroup = 'games' | 'students' | 'data' | 'tools'

export const HELP_GROUPS: { id: HelpGroup; title: string; icon: string }[] = [
  { id: 'games', title: 'Juegos', icon: '🎮' },
  { id: 'students', title: 'Estudiantes, puntos y ranking', icon: '🙋' },
  { id: 'tools', title: 'Otras herramientas', icon: '🧰' },
  { id: 'data', title: 'Mis datos y archivos', icon: '💾' }
]

/** A dónde lleva el botón «Llévame ahí» */
export type HelpTarget =
  | { kind: 'tool'; id: string; label: string }
  | { kind: 'game'; id: string; label: string }
  | { kind: 'about'; label: string }

export interface HelpTopic {
  id: string
  group: HelpGroup
  icon: string
  /** Lo que la persona quiere hacer, con sus palabras */
  question: string
  /** Pasos cortos */
  steps: string[]
  /** Palabras que la persona podría escribir en el buscador */
  keywords?: string[]
  target?: HelpTarget
  /** Una frase para el consejo del inicio; si falta, no sale como consejo */
  tip?: string
  /** ¿Ya usó esto? Los consejos de lo que todavía no se usó salen primero */
  done?: () => boolean
}

const list = (key: string): unknown[] => {
  const v = getDurable<unknown>(key, [])
  return Array.isArray(v) ? v : []
}
// Esos datos guardan solo lo que la persona agregó (lo que trae la app no se guarda aparte)
const hasCustom = (key: string): boolean => list(key).length > 0

export const HELP: HelpTopic[] = [
  {
    id: 'own-questions',
    group: 'games',
    icon: '✏️',
    question: 'Quiero poner mis propias preguntas',
    steps: [
      'Abre «Juegos» y elige un juego de preguntas (por ejemplo «Concurso» o «¿Quién quiere ser millonario?»).',
      'Toca «✏️ Mis preguntas» (en el millonario se llama «✏️ Escribir mis propias preguntas»).',
      'Escribe una pregunta, o pega varias de golpe. Quedan guardadas en tu computadora.',
      'Para jugar solo con las tuyas, activa «Usar solo mis preguntas» o el filtro de las propias.',
      'También puedes guardarlas en un archivo y abrirlas en otra computadora.'
    ],
    keywords: ['preguntas propias', 'agregar', 'crear', 'escribir', 'pegar', 'mis preguntas'],
    target: { kind: 'game', id: 'concurso', label: 'Abrir «Concurso»' },
    tip: 'Puedes agregar tus propias preguntas a los juegos: entra a un juego de preguntas y toca «✏️ Mis preguntas».',
    done: () => hasCustom('bank-questions') || hasCustom('bank-statements')
  },
  {
    id: 'own-lists',
    group: 'games',
    icon: '🔤',
    question: 'Quiero usar mis propias palabras o parejas',
    steps: [
      'Abre un juego de palabras o de parejas (por ejemplo «Ahorcado» o «Memoria»).',
      'Antes de empezar, toca «✏️ Mis listas» (palabras) o «✏️ Mis parejas» (memoria).',
      'Crea la lista, guárdala y elígela cuando juegues.'
    ],
    keywords: ['palabras', 'listas', 'parejas', 'vocabulario', 'ahorcado', 'memoria'],
    target: { kind: 'tool', id: 'games', label: 'Ir a «Juegos»' },
    tip: 'En los juegos de palabras y de parejas también puedes usar tus propias listas, con «✏️ Mis listas» y «✏️ Mis parejas».',
    done: () => hasCustom('bank-words') || hasCustom('bank-pairs')
  },
  {
    id: 'find-game',
    group: 'games',
    icon: '🔍',
    question: 'Quiero encontrar un juego para mi tema o grado',
    steps: [
      'Abre «Juegos».',
      'Escribe en el buscador o usa los filtros: asignatura, grado y cómo se juega.',
      'Toca la ⭐ de un juego para tenerlo siempre a la mano arriba.'
    ],
    keywords: ['buscar', 'filtrar', 'grado', 'asignatura', 'favorito', 'matematica', 'espanol'],
    target: { kind: 'tool', id: 'games', label: 'Ir a «Juegos»' },
    tip: 'En «Juegos» puedes filtrar por asignatura, grado y cómo se juega, y marcar tus favoritos con la ⭐.',
    done: () => list('favorite-games').length > 0
  },
  {
    id: 'play-students',
    group: 'games',
    icon: '👥',
    question: 'Quiero jugar con mis estudiantes, por nombre o en equipos',
    steps: [
      'Primero guarda tu grupo en «Lista de estudiantes» (en «Para el aula»).',
      'Al empezar un juego, elige «🙋 Estudiantes de mi grupo» en lugar de «👥 Equipos».',
      'Quita a quien no vino hoy y empieza.'
    ],
    keywords: ['equipos', 'jugadores', 'turnos', 'nombres'],
    target: { kind: 'tool', id: 'students', label: 'Abrir «Lista de estudiantes»' },
    tip: 'Para que los juegos usen los nombres de tus estudiantes, elige «Estudiantes de mi grupo» al empezar.'
  },
  {
    id: 'groups',
    group: 'students',
    icon: '📋',
    question: 'Quiero guardar la lista de mis estudiantes',
    steps: [
      'Abre «Lista de estudiantes» (en «Para el aula»).',
      'Toca «＋ Nuevo grupo» y ponle nombre.',
      'Escribe los nombres o pégalos todos juntos.',
      'Se guarda sola. No hace falta tocar nada más.'
    ],
    keywords: ['grupo', 'lista', 'nombres', 'seccion', 'clase', 'guardar'],
    target: { kind: 'tool', id: 'students', label: 'Abrir «Lista de estudiantes»' },
    tip: 'Guarda la lista de tus estudiantes una vez en «Lista de estudiantes» y úsala en los juegos, los puntos y la ruleta.',
    done: () => {
      const d = getDurable<{ groups?: unknown[] }>('classrooms', {})
      return (d.groups?.length ?? 0) > 0
    }
  },
  {
    id: 'points',
    group: 'students',
    icon: '⭐',
    question: 'Quiero dar puntos a mis estudiantes',
    steps: [
      'Abre «Puntos y ranking» y ve a la pestaña «⭐ Puntos».',
      'Elige el grupo y escribe o elige la razón (por ejemplo «Buen comportamiento»).',
      'Toca el emoji para dar el punto: ⭐ 1, 💎 5, 👑 10, 💯 100.',
      'Si te equivocas, usa «Deshacer». Los puntos quedan guardados aunque cierres la app.'
    ],
    keywords: ['puntos', 'estrellas', 'premio', 'conducta', 'comportamiento'],
    target: { kind: 'tool', id: 'stars', label: 'Abrir «Puntos y ranking»' },
    tip: 'Los puntos que das tú se guardan por estudiante, con la razón y la fecha. Los ves en «Puntos y ranking».',
    done: () => {
      const d = getDurable<{ events?: unknown[] }>('stars', {})
      return (d.events?.length ?? 0) > 0
    }
  },
  {
    id: 'ranking',
    group: 'students',
    icon: '🏆',
    question: 'Quiero ver quién va ganando en los juegos',
    steps: [
      'Juega en «Juegos» eligiendo «🙋 Estudiantes de mi grupo» (con equipos no se guarda).',
      'Al terminar la partida, los puntajes pasan solos al ranking.',
      'Abre «Puntos y ranking» y ve a la pestaña «🏆 Ranking de juegos». Puedes filtrar por juego y por grupo.',
      'El ranking no se mezcla con los puntos que das a mano.'
    ],
    keywords: ['ranking', 'puntajes', 'ganador', 'tabla', 'posiciones', 'mejores'],
    target: { kind: 'tool', id: 'stars', label: 'Abrir «Puntos y ranking»' },
    tip: 'Los juegos que juegas con estudiantes de un grupo guardado llenan solos un ranking, que puedes filtrar por juego.',
    done: () => getDurable<RankingData>('ranking', { sessions: [] }).sessions.length > 0
  },
  {
    id: 'random-pick',
    group: 'tools',
    icon: '🎡',
    question: 'Quiero sortear a un estudiante',
    steps: [
      'Abre «Ruleta», escribe los nombres o carga un grupo que ya guardaste, y gírala.',
      'Para un número al azar usa «Número al azar».'
    ],
    keywords: ['sorteo', 'azar', 'ruleta', 'rifa', 'escoger'],
    target: { kind: 'tool', id: 'wheel', label: 'Abrir «Ruleta»' }
  },
  {
    id: 'timer',
    group: 'tools',
    icon: '⏱️',
    question: 'Quiero un temporizador para la clase',
    steps: ['Abre «Temporizador para el aula», pon el tiempo y empieza.'],
    keywords: ['cronometro', 'tiempo', 'minutos', 'reloj'],
    target: { kind: 'tool', id: 'timer', label: 'Abrir el temporizador' }
  },
  {
    id: 'first-download',
    group: 'tools',
    icon: '⬇️',
    question: 'Una herramienta me pide descargar algo',
    steps: [
      'Recortar video, sacar audio, descargar de YouTube, quitar fondos y las voces de los juegos usan piezas grandes que no vienen en el instalador.',
      'Se descargan solas al abrir la app, una sola vez y con internet; después funcionan sin conexión.',
      'Si la descarga falla, toca «Reintentar».'
    ],
    keywords: [
      'descargar',
      'internet',
      'ffmpeg',
      'video',
      'youtube',
      'fondo',
      'componentes',
      'voz',
      'voces'
    ]
  },
  {
    id: 'files',
    group: 'data',
    icon: '📁',
    question: '¿Dónde quedan mis archivos?',
    steps: [
      'Todo lo que crea Educando queda en tu carpeta Documentos, dentro de «Educando».',
      'Para abrirla, toca «📁 Mis archivos» en el inicio.'
    ],
    keywords: ['carpeta', 'documentos', 'resultado', 'guardado', 'archivos']
  },
  {
    id: 'backup',
    group: 'data',
    icon: '💾',
    question: 'Quiero guardar una copia de mis datos o pasarlos a otra computadora',
    steps: [
      'Abre «💜 Acerca de» y busca «Mis datos» (también está en «Lista de estudiantes»).',
      'Toca «⬇ Guardar una copia ahora»: queda en un archivo.',
      'En la otra computadora, abre el mismo lugar y toca «⬆ Restaurar una copia» y elige ese archivo.',
      'Aparte, la app guarda sola un respaldo cada día en Documentos/Educando/Respaldo.'
    ],
    keywords: [
      'respaldo',
      'copia',
      'seguridad',
      'restaurar',
      'perdi',
      'se borro',
      'otra computadora'
    ],
    target: { kind: 'about', label: 'Abrir «Acerca de»' },
    tip: 'Tus datos tienen respaldo automático diario. Para pasarlos a otra computadora, usa «Mis datos» en «Acerca de».'
  }
]

export const topicById = (id: string): HelpTopic | undefined => HELP.find((t) => t.id === id)
