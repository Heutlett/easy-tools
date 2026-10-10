/*
 * Parejas de Español para el juego de memoria.
 * Sinónimos, antónimos, singular–plural, masculino–femenino, diminutivos, rimas, homófonos, etc.
 */
import { definePairLists } from '../define'

export default definePairLists('espanol', [
  {
    title: 'Palabra y dibujo',
    grades: [1, 2],
    topic: 'Vocabulario',
    pairs: [
      ['perro', '🐶'],
      ['gato', '🐱'],
      ['sol', '☀️'],
      ['luna', '🌙'],
      ['casa', '🏠'],
      ['banano', '🍌'],
      ['bus', '🚌'],
      ['libro', '📖'],
      ['flor', '🌸'],
      ['pez', '🐟']
    ]
  },
  {
    title: 'Mayúscula y minúscula',
    grades: [1, 2],
    topic: 'Mayúsculas y punto',
    pairs: [
      ['A', 'a'],
      ['E', 'e'],
      ['M', 'm'],
      ['S', 's'],
      ['L', 'l'],
      ['P', 'p'],
      ['T', 't'],
      ['D', 'd'],
      ['R', 'r']
    ]
  },
  {
    title: 'Sílaba inicial y palabra',
    grades: [1, 2],
    topic: 'Sílabas',
    pairs: [
      ['pa', 'pato'],
      ['me', 'mesa'],
      ['sa', 'sapo'],
      ['lu', 'luna'],
      ['ca', 'casa'],
      ['mo', 'mono'],
      ['pe', 'perro'],
      ['ro', 'rosa']
    ]
  },
  {
    title: 'Animales y sus sonidos',
    grades: [1, 2],
    topic: 'Rimas y adivinanzas',
    pairs: [
      ['perro', 'guau'],
      ['gato', 'miau'],
      ['vaca', 'muuu'],
      ['pato', 'cuac'],
      ['gallo', 'quiquiriquí'],
      ['pollito', 'pío'],
      ['rana', 'croac'],
      ['cerdo', 'oinc']
    ]
  },
  {
    title: 'Palabras que riman',
    grades: [1, 2, 3],
    topic: 'Rimas y adivinanzas',
    pairs: [
      ['gato', 'pato'],
      ['luna', 'cuna'],
      ['sol', 'caracol'],
      ['casa', 'masa'],
      ['ratón', 'balón'],
      ['flor', 'color'],
      ['pelota', 'bota'],
      ['pan', 'volcán']
    ]
  },
  {
    title: 'Masculino y femenino',
    grades: [1, 2, 3],
    topic: 'Sustantivos',
    pairs: [
      ['niño', 'niña'],
      ['gato', 'gata'],
      ['profesor', 'profesora'],
      ['gallo', 'gallina'],
      ['caballo', 'yegua'],
      ['rey', 'reina'],
      ['abuelo', 'abuela'],
      ['tío', 'tía'],
      ['papá', 'mamá']
    ]
  },
  {
    title: 'Singular y plural',
    grades: [2, 3, 4],
    topic: 'Sustantivos',
    pairs: [
      ['lápiz', 'lápices'],
      ['luz', 'luces'],
      ['pez', 'peces'],
      ['canción', 'canciones'],
      ['voz', 'voces'],
      ['flor', 'flores'],
      ['nariz', 'narices'],
      ['ratón', 'ratones'],
      ['lombriz', 'lombrices']
    ]
  },
  {
    title: 'Antónimos (palabras contrarias)',
    grades: [2, 3, 4],
    topic: 'Sinónimos y antónimos',
    pairs: [
      ['alto', 'bajo'],
      ['día', 'noche'],
      ['abrir', 'cerrar'],
      ['limpio', 'sucio'],
      ['subir', 'bajar'],
      ['alegre', 'triste'],
      ['caliente', 'frío'],
      ['lleno', 'vacío'],
      ['rápido', 'lento'],
      ['duro', 'blando']
    ]
  },
  {
    title: 'Diminutivos',
    grades: [3, 4],
    topic: 'Sustantivos',
    pairs: [
      ['casa', 'casita'],
      ['perro', 'perrito'],
      ['mesa', 'mesita'],
      ['gato', 'gatito'],
      ['flor', 'florecita'],
      ['pájaro', 'pajarito'],
      ['zapato', 'zapatito'],
      ['campana', 'campanita']
    ]
  },
  {
    title: 'Sinónimos (palabras parecidas)',
    grades: [3, 4, 5, 6],
    topic: 'Sinónimos y antónimos',
    pairs: [
      ['bonito', 'lindo'],
      ['rápido', 'veloz'],
      ['contento', 'feliz'],
      ['enorme', 'gigante'],
      ['comenzar', 'empezar'],
      ['hablar', 'conversar'],
      ['casa', 'hogar'],
      ['mirar', 'observar'],
      ['cansado', 'agotado']
    ]
  },
  {
    title: 'Homófonos (suenan igual)',
    grades: [5, 6],
    topic: 'Ortografía',
    pairs: [
      ['hola', 'ola'],
      ['tuvo', 'tubo'],
      ['hecho', 'echo'],
      ['bello', 'vello'],
      ['sabia', 'savia'],
      ['vaca', 'baca'],
      ['cima', 'sima']
    ]
  },
  {
    title: 'Verbos: infinitivo y pasado',
    grades: [4, 5, 6],
    topic: 'Tiempos verbales',
    pairs: [
      ['comer', 'comió'],
      ['cantar', 'cantó'],
      ['correr', 'corrió'],
      ['escribir', 'escribió'],
      ['hacer', 'hizo'],
      ['ir', 'fue'],
      ['ver', 'vio'],
      ['decir', 'dijo']
    ]
  },
  {
    title: 'Lugar y gentilicio',
    grades: [4, 5, 6],
    topic: 'Adjetivos',
    pairs: [
      ['Cartago', 'cartaginés'],
      ['Heredia', 'herediano'],
      ['Alajuela', 'alajuelense'],
      ['Limón', 'limonense'],
      ['Guanacaste', 'guanacasteco'],
      ['Puntarenas', 'puntarenense'],
      ['San José', 'josefino'],
      ['Costa Rica', 'costarricense']
    ]
  },
  {
    title: 'Palabra y significado',
    grades: [5, 6],
    topic: 'Vocabulario',
    pairs: [
      ['efímero', 'dura muy poco'],
      ['angosto', 'estrecho'],
      ['conciso', 'breve y preciso'],
      ['astuto', 'listo y mañoso'],
      ['frágil', 'se rompe fácil'],
      ['sendero', 'camino angosto'],
      ['generoso', 'comparte con otros'],
      ['cosecha', 'frutos del campo']
    ]
  }
])
