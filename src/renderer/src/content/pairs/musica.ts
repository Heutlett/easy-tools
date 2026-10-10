import { definePairLists } from '../define'

/**
 * Parejas de Educación Musical para «Memoria».
 * Cada lado de las parejas es único dentro de su lista, para no repetir cartas.
 */
export default definePairLists('musica', [
  {
    title: 'Los opuestos del sonido',
    grades: [1, 2],
    topic: 'Cualidades del sonido',
    pairs: [
      ['🐢', 'Lento'],
      ['🐇', 'Rápido'],
      ['🔊', 'Fuerte'],
      ['🔈', 'Suave'],
      ['🤫', 'Silencio'],
      ['🎶', 'Música'],
      ['🐘', 'Sonido grave'],
      ['🐦', 'Sonido agudo']
    ]
  },
  {
    title: 'Instrumentos: dibujo y nombre',
    grades: [1, 2, 3],
    topic: 'Instrumentos musicales',
    pairs: [
      ['🎻', 'Violín'],
      ['🎺', 'Trompeta'],
      ['🥁', 'Tambor'],
      ['🎸', 'Guitarra'],
      ['🎹', 'Piano'],
      ['🎷', 'Saxofón'],
      ['🪗', 'Acordeón']
    ]
  },
  {
    title: 'Instrumentos y su familia',
    grades: [2, 3, 4, 5, 6],
    topic: 'Instrumentos musicales',
    pairs: [
      ['🎻', 'Cuerda frotada'],
      ['🎸', 'Cuerda pulsada'],
      ['🎷', 'Viento madera'],
      ['🎺', 'Viento metal'],
      ['🥁', 'Percusión'],
      ['🎹', 'Teclado']
    ]
  },
  {
    title: 'Figuras y signos musicales',
    grades: [3, 4, 5, 6],
    topic: 'Figuras y silencios',
    pairs: [
      ['♩', 'Negra'],
      ['♪', 'Corchea'],
      ['♫', 'Par de corcheas'],
      ['♬', 'Par de semicorcheas'],
      ['♯', 'Sostenido'],
      ['♭', 'Bemol'],
      ['♮', 'Becuadro']
    ]
  },
  {
    title: 'Figuras y su duración',
    grades: [3, 4, 5, 6],
    topic: 'Figuras y silencios',
    pairs: [
      ['Redonda', '4 tiempos'],
      ['Blanca', '2 tiempos'],
      ['Negra', '1 tiempo'],
      ['Corchea', '½ tiempo'],
      ['Semicorchea', '¼ de tiempo'],
      ['Negra con puntillo', '1½ tiempos'],
      ['Blanca con puntillo', '3 tiempos']
    ]
  },
  {
    title: 'Compases y partes de la partitura',
    grades: [3, 4, 5, 6],
    topic: 'Compases',
    pairs: [
      ['2/4', 'Dos tiempos'],
      ['3/4', 'Tres tiempos'],
      ['4/4', 'Cuatro tiempos'],
      ['Compás binario', 'Pulsos de a dos'],
      ['Compás ternario', 'Pulsos de a tres'],
      ['Línea de compás', 'Separa un compás de otro'],
      ['Barra final', 'La música terminó']
    ]
  },
  {
    title: 'Notas en el pentagrama (clave de sol)',
    grades: [3, 4, 5, 6],
    topic: 'Pentagrama y notas',
    pairs: [
      ['Mi', 'Primera línea'],
      ['Sol', 'Segunda línea'],
      ['Si', 'Tercera línea'],
      ['Re', 'Cuarta línea'],
      ['La', 'Segundo espacio'],
      ['Do', 'Tercer espacio']
    ]
  },
  {
    title: 'Elementos de la música',
    grades: [2, 3, 4, 5, 6],
    topic: 'Elementos y forma de la música',
    pairs: [
      ['Altura', 'Agudo o grave'],
      ['Intensidad', 'Fuerte o suave'],
      ['Duración', 'Largo o corto'],
      ['Timbre', 'Color del sonido'],
      ['Pulso', 'Latido constante'],
      ['Ritmo', 'Sonidos largos y cortos'],
      ['Melodía', 'Sonidos que se suceden'],
      ['Armonía', 'Sonidos a la vez']
    ]
  },
  {
    title: 'Términos italianos y su significado',
    grades: [5, 6],
    topic: 'Dinámica y tempo',
    pairs: [
      ['Forte', 'Fuerte'],
      ['Piano', 'Suave'],
      ['Mezzoforte', 'Medio fuerte'],
      ['Allegro', 'Rápido'],
      ['Adagio', 'Lento'],
      ['Andante', 'Moderadamente lento'],
      ['Crescendo', 'Más fuerte poco a poco'],
      ['Diminuendo', 'Más suave poco a poco'],
      ['Staccato', 'Corto y separado'],
      ['Legato', 'Unido, sin cortes']
    ]
  },
  {
    title: 'Música y cultura de Costa Rica',
    grades: [3, 4, 5, 6],
    topic: 'Música de Costa Rica',
    pairs: [
      ['Punto guanacasteco', 'Baile nacional'],
      ['Marimba', 'Instrumento nacional'],
      ['Calipso', 'Ritmo del Caribe'],
      ['Quijongo', 'Arco con calabaza'],
      ['Cimarrona', 'Viento y percusión'],
      ['Parrandera', 'Ritmo de Guanacaste'],
      ['Letra del Himno Nacional', 'José María Zeledón'],
      ['Música del Himno Nacional', 'Manuel María Gutiérrez']
    ]
  },
  {
    title: 'Músicas del mundo',
    grades: [3, 4, 5, 6],
    topic: 'Música del mundo',
    pairs: [
      ['Tango', 'Argentina'],
      ['Samba', 'Brasil'],
      ['Mariachi', 'México'],
      ['Cumbia', 'Colombia'],
      ['Merengue', 'República Dominicana'],
      ['Flamenco', 'España'],
      ['Reggae', 'Jamaica']
    ]
  },
  {
    title: 'Compositores y sus obras',
    grades: [5, 6],
    topic: 'Compositores y obras',
    pairs: [
      ['Vivaldi', 'Las cuatro estaciones'],
      ['Beethoven', 'Novena Sinfonía'],
      ['Tchaikovsky', 'El cascanueces'],
      ['Prokofiev', 'Pedro y el lobo'],
      ['Mozart', 'Pequeña serenata nocturna'],
      ['Bach', 'Conciertos de Brandeburgo'],
      ['Strauss', 'El Danubio azul'],
      ['Chopin', 'Nocturnos para piano']
    ]
  }
])
