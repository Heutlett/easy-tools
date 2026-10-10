import { defineWordLists } from '../define'

/**
 * Listas de palabras de Educación Musical (ahorcado, palabras desordenadas, mímica…).
 * Temas iguales a los de questions/musica.ts.
 */
export default defineWordLists('musica', [
  {
    title: 'Instrumentos de cuerda',
    grades: [2, 3, 4, 5, 6],
    topic: 'Instrumentos musicales',
    words: [
      ['violín', 'El instrumento de cuerda más agudo de la orquesta'],
      ['viola', 'Un poco más grande y grave que el violín'],
      ['violonchelo', 'Se toca sentado y apoyado en el suelo'],
      ['contrabajo', 'El instrumento de cuerda frotada más grave'],
      ['guitarra', 'Tiene seis cuerdas y se pulsa'],
      ['arpa', 'Tiene muchas cuerdas verticales y se toca con los dedos'],
      ['mandolina', 'Pequeña, con cuerdas dobles, parecida a un laúd'],
      ['ukelele', 'Guitarra muy pequeña de cuatro cuerdas'],
      ['laúd', 'Instrumento antiguo de cuerdas con cuerpo en forma de pera'],
      ['quijongo', 'Arco musical con calabaza de la tradición de Guanacaste']
    ]
  },
  {
    title: 'Instrumentos de viento madera',
    grades: [3, 4, 5, 6],
    topic: 'Instrumentos musicales',
    words: [
      ['flauta', 'Se sopla de lado; es de viento madera'],
      ['flautín', 'La flauta más pequeña y aguda'],
      ['oboe', 'Se toca con una caña doble; suena como el pato de Pedro y el lobo'],
      ['clarinete', 'Tiene una sola caña en la boquilla'],
      ['fagot', 'Instrumento grave de caña doble, muy largo'],
      ['saxofón', 'De metal, pero usa una caña; muy usado en el jazz'],
      ['flauta dulce', 'La que se toca en la clase de música'],
      ['gaita', 'Tiene una bolsa de aire y varios tubos']
    ]
  },
  {
    title: 'Instrumentos de viento metal',
    grades: [3, 4, 5, 6],
    topic: 'Instrumentos musicales',
    words: [
      ['trompeta', 'Instrumento de metal con tres pistones y sonido brillante'],
      ['trombón', 'Cambia de nota deslizando una vara'],
      ['trompa', 'Metal enrollado con una campana grande y redonda'],
      ['tuba', 'El instrumento de metal más grande y grave'],
      ['corneta', 'Parecida a la trompeta, pero más corta'],
      ['bugle', 'Pequeño instrumento de metal sin pistones, usado en toques militares'],
      ['bombardino', 'Metal de sonido grave, de la familia de la tuba'],
      ['clarín', 'Trompeta sencilla usada en toques como la diana']
    ]
  },
  {
    title: 'Instrumentos de percusión',
    grades: [1, 2, 3, 4, 5, 6],
    topic: 'Instrumentos musicales',
    words: [
      ['tambor', 'Se golpea con baquetas o con las manos'],
      ['bombo', 'El tambor más grande y grave'],
      ['platillos', 'Dos discos de metal que se chocan'],
      ['triángulo', 'Una varilla de metal en forma de figura geométrica'],
      ['xilófono', 'Tiene láminas de madera de distintos tamaños'],
      ['marimba', 'Instrumento nacional de Costa Rica, con teclas de madera'],
      ['pandereta', 'Aro con sonajas que se agita o se golpea'],
      ['maracas', 'Se sacuden y suenan con semillas o arroz adentro'],
      ['claves', 'Dos palitos de madera que se golpean'],
      ['timbal', 'Tambor grande con forma de olla'],
      ['güiro', 'Se raspa con una varilla'],
      ['castañuelas', 'Pequeñas piezas de madera que se tocan con los dedos'],
      ['redoblante', 'Tambor pequeño y seco de las bandas'],
      ['campana', 'De metal; suena al golpearla o agitarla']
    ]
  },
  {
    title: 'Instrumentos para empezar a tocar',
    grades: [1, 2, 3],
    topic: 'Instrumentos musicales',
    words: [
      ['tambor', 'Se golpea'],
      ['maracas', 'Se sacuden'],
      ['triángulo', 'Una varilla de metal que suena con un golpe'],
      ['pandereta', 'Tiene sonajas'],
      ['claves', 'Dos palitos de madera'],
      ['flauta', 'Se sopla'],
      ['guitarra', 'Tiene cuerdas'],
      ['piano', 'Tiene teclas blancas y negras'],
      ['xilófono', 'Tiene láminas que se golpean'],
      ['campana', 'Suena ding-dong'],
      ['platillos', 'Se chocan uno contra otro']
    ]
  },
  {
    title: 'Música y bailes tradicionales de Costa Rica',
    grades: [3, 4, 5, 6],
    topic: 'Música de Costa Rica',
    words: [
      ['punto guanacasteco', 'El baile nacional de Costa Rica'],
      ['calipso', 'Ritmo tradicional del Caribe costarricense'],
      ['parrandera', 'Ritmo tradicional guanacasteco'],
      ['pasillo', 'Ritmo costarricense que viene del pasillo colombiano'],
      ['tambito', 'Ritmo folclórico costarricense'],
      ['torito', 'Baile típico de Costa Rica'],
      ['botijuela', 'Baile típico de Costa Rica'],
      ['cuadrilla', 'Baile tradicional que también se baila en el Caribe costarricense'],
      ['turno', 'Fiesta popular donde suele tocar la cimarrona'],
      ['mascarada', 'Tradición con máscaras y música de cimarrona']
    ]
  },
  {
    title: 'Instrumentos de la tradición costarricense',
    grades: [2, 3, 4, 5, 6],
    topic: 'Música de Costa Rica',
    words: [
      ['marimba', 'Instrumento nacional, con teclas de madera'],
      ['quijongo', 'Arco musical con calabaza, de Guanacaste'],
      ['ocarina', 'Flauta de barro de origen antiguo'],
      ['guitarra', 'Acompaña canciones y bailes tradicionales'],
      ['cimarrona', 'Conjunto de viento y percusión que anima los turnos'],
      ['trompeta', 'Instrumento de metal muy usado en la cimarrona'],
      ['tuba', 'Metal grave de la cimarrona'],
      ['trombón', 'Metal de vara, también en la cimarrona']
    ]
  },
  {
    title: 'Términos de dinámica y velocidad',
    grades: [5, 6],
    topic: 'Dinámica y tempo',
    words: [
      ['forte', 'Fuerte'],
      ['piano', 'Suave'],
      ['mezzoforte', 'Medio fuerte'],
      ['fortissimo', 'Muy fuerte'],
      ['pianissimo', 'Muy suave'],
      ['crescendo', 'Aumentar poco a poco la intensidad'],
      ['diminuendo', 'Disminuir poco a poco la intensidad'],
      ['allegro', 'Rápido y alegre'],
      ['adagio', 'Lento'],
      ['andante', 'Moderadamente lento'],
      ['moderato', 'Velocidad moderada'],
      ['presto', 'Muy rápido'],
      ['largo', 'Muy lento y amplio'],
      ['ritardando', 'Ir poco a poco más lento'],
      ['accelerando', 'Ir poco a poco más rápido'],
      ['legato', 'Notas unidas, sin cortes'],
      ['staccato', 'Notas cortas y separadas'],
      ['fermata', 'Alarga la nota más de lo normal']
    ]
  },
  {
    title: 'Figuras, silencios y signos del ritmo',
    grades: [3, 4, 5, 6],
    topic: 'Figuras y silencios',
    words: [
      ['redonda', 'Dura cuatro tiempos'],
      ['blanca', 'Dura dos tiempos'],
      ['negra', 'Dura un tiempo'],
      ['corchea', 'Dura medio tiempo'],
      ['semicorchea', 'Dura un cuarto de tiempo'],
      ['tresillo', 'Tres figuras iguales en el tiempo de dos'],
      ['puntillo', 'Punto que suma la mitad del valor de la figura'],
      ['silencio', 'Pausa sin sonido'],
      ['compás', 'Parte de la música entre dos líneas verticales'],
      ['ligadura', 'Une dos notas iguales para sumar su duración'],
      ['calderón', 'Signo que alarga una nota'],
      ['pulso', 'Latido constante de la música'],
      ['acento', 'Golpe más fuerte dentro del compás']
    ]
  },
  {
    title: 'Notas musicales y escritura',
    grades: [3, 4, 5, 6],
    topic: 'Pentagrama y notas',
    words: [
      ['pentagrama', 'Cinco líneas donde se escriben las notas'],
      ['clave de sol', 'Signo que se coloca al inicio del pentagrama'],
      ['sostenido', 'Sube la nota medio tono'],
      ['bemol', 'Baja la nota medio tono'],
      ['becuadro', 'Cancela un sostenido o un bemol'],
      ['escala', 'Notas ordenadas de grave a agudo'],
      ['octava', 'Distancia entre una nota y la siguiente con el mismo nombre'],
      ['semitono', 'La menor distancia entre dos notas'],
      ['partitura', 'Música escrita para leer o tocar'],
      ['melodía', 'Sucesión de sonidos con ritmo'],
      ['armonía', 'Notas que suenan al mismo tiempo']
    ]
  },
  {
    title: 'Elementos de la música',
    grades: [2, 3, 4, 5, 6],
    topic: 'Elementos y forma de la música',
    words: [
      ['ritmo', 'Combinación de sonidos largos y cortos'],
      ['melodía', 'La parte que podemos cantar o silbar'],
      ['armonía', 'Sonidos que se combinan al mismo tiempo'],
      ['timbre', 'El color del sonido'],
      ['pulso', 'Latido regular de la música'],
      ['intensidad', 'Qué tan fuerte o suave suena'],
      ['duración', 'Qué tan largo o corto es un sonido'],
      ['altura', 'Qué tan agudo o grave es un sonido'],
      ['tempo', 'La velocidad de la música'],
      ['dinámica', 'Los cambios de intensidad'],
      ['estrofa', 'Parte de una canción con la misma música'],
      ['estribillo', 'Parte que se repite después de cada estrofa'],
      ['ostinato', 'Patrón que se repite insistentemente'],
      ['canon', 'La misma melodía entra en momentos distintos']
    ]
  },
  {
    title: 'Géneros y músicas del mundo',
    grades: [4, 5, 6],
    topic: 'Música del mundo',
    words: [
      ['tango', 'Baile y música de Argentina'],
      ['samba', 'Ritmo festivo de Brasil'],
      ['mariachi', 'Música tradicional de México'],
      ['cumbia', 'Ritmo que se originó en Colombia'],
      ['merengue', 'Ritmo bailable de República Dominicana'],
      ['flamenco', 'Música y baile de España'],
      ['reggae', 'Género que nació en Jamaica'],
      ['jazz', 'Género que se desarrolló en Estados Unidos'],
      ['bolero', 'Género de música romántica'],
      ['vals', 'Baile en compás de tres tiempos'],
      ['ópera', 'Obra de teatro cantada con orquesta'],
      ['calipso', 'Ritmo del Caribe, también muy querido en Limón'],
      ['ranchera', 'Canción popular mexicana'],
      ['zampoña', 'Flauta andina de varios tubos'],
      ['charango', 'Pequeña guitarra andina']
    ]
  },
  {
    title: 'Compositores famosos',
    grades: [5, 6],
    topic: 'Compositores y obras',
    words: [
      ['Bach', 'Compositor alemán del Barroco'],
      ['Mozart', 'Compositor austriaco, niño prodigio'],
      ['Beethoven', 'Compuso la Novena Sinfonía con la Oda a la alegría'],
      ['Vivaldi', 'Compuso Las cuatro estaciones'],
      ['Chopin', 'Compuso sobre todo para piano'],
      ['Tchaikovsky', 'Compuso El cascanueces'],
      ['Haendel', 'Compositor barroco alemán'],
      ['Haydn', 'Compositor austriaco del Clasicismo'],
      ['Schubert', 'Compositor austriaco famoso por sus canciones'],
      ['Prokofiev', 'Compuso Pedro y el lobo'],
      ['Strauss', 'Famoso por sus valses'],
      ['Gutiérrez', 'Compuso la música del Himno Nacional de Costa Rica'],
      ['Zeledón', 'Escribió la letra del Himno Nacional de Costa Rica']
    ]
  },
  {
    title: 'Himnos y cantos patrios de Costa Rica',
    grades: [1, 2, 3, 4, 5, 6],
    topic: 'Himnos y cantos patrios',
    words: [
      'Himno Nacional',
      'Himno a la Bandera',
      'Himno al Árbol',
      'Himno a Juan Santamaría',
      'Marcha Santa Rosa',
      'La Anexión de Guanacaste',
      'Diana',
      'Villancico',
      'Canción de cuna'
    ]
  },
  {
    title: 'El mundo de la orquesta y el coro',
    grades: [4, 5, 6],
    topic: 'Instrumentos musicales',
    words: [
      ['orquesta', 'Grupo grande de instrumentos de cuerda, viento y percusión'],
      ['director', 'Guía a los músicos con la batuta'],
      ['batuta', 'Varita que usa el director'],
      ['partitura', 'Música escrita'],
      ['atril', 'Soporte donde se coloca la partitura'],
      ['solista', 'Músico que toca o canta solo'],
      ['coro', 'Grupo de personas que cantan juntas'],
      ['banda', 'Grupo de vientos y percusión'],
      ['cuarteto', 'Grupo de cuatro músicos'],
      ['ensamble', 'Agrupación que toca o canta junta'],
      ['concierto', 'Presentación musical frente al público'],
      ['soprano', 'La voz más aguda'],
      ['tenor', 'Voz masculina aguda'],
      ['contralto', 'Voz femenina grave']
    ]
  }
])
