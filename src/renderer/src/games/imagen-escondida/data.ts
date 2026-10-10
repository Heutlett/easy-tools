import type { Grade, SubjectId } from '../../content/types'

/** Un misterio: un emoji gigante que se va descubriendo */
export interface Mystery {
  id: string
  emoji: string
  /** Cómo se muestra la respuesta */
  answer: string
  /** Otras formas de decirlo que también valen */
  accepts: string[]
  subject: SubjectId
  topic: string
  grades: Grade[]
  /** Hecho con una imagen del docente */
  custom?: boolean
}

type Tier = 'f' | 'm' | 'd'
const GRADES: Record<Tier, Grade[]> = {
  f: [1, 2, 3, 4],
  m: [2, 3, 4, 5, 6],
  d: [4, 5, 6]
}

const defs: [SubjectId, string, [string, string, string[], Tier][]][] = [
  [
    'ciencias',
    'Animales de Costa Rica',
    [
      ['🦥', 'Perezoso', ['perezoso', 'oso perezoso', 'pereza'], 'f'],
      ['🐢', 'Tortuga', ['tortuga', 'tortuga marina'], 'f'],
      ['🐸', 'Rana', ['rana', 'sapo'], 'f'],
      ['🦜', 'Loro', ['loro', 'lora', 'papagayo', 'perico', 'lapa'], 'f'],
      ['🐒', 'Mono', ['mono', 'mico', 'mono congo', 'mono carablanca'], 'f'],
      ['🦋', 'Mariposa', ['mariposa'], 'f'],
      ['🐊', 'Cocodrilo', ['cocodrilo', 'lagarto', 'caiman'], 'm'],
      ['🐍', 'Serpiente', ['serpiente', 'culebra', 'vibora'], 'm'],
      ['🦈', 'Tiburón', ['tiburon'], 'm'],
      ['🐬', 'Delfín', ['delfin'], 'f'],
      ['🐋', 'Ballena', ['ballena'], 'f'],
      ['🦀', 'Cangrejo', ['cangrejo', 'jaiba'], 'm'],
      ['🦎', 'Lagartija', ['lagartija', 'lagarto', 'reptil', 'iguana'], 'm'],
      ['🦉', 'Búho', ['buho', 'lechuza', 'mochuelo'], 'm'],
      ['🦅', 'Águila', ['aguila'], 'm'],
      ['🐝', 'Abeja', ['abeja'], 'f'],
      ['🐜', 'Hormiga', ['hormiga'], 'f'],
      ['🦇', 'Murciélago', ['murcielago'], 'm'],
      ['🐙', 'Pulpo', ['pulpo'], 'm']
    ]
  ],
  [
    'ciencias',
    'Animales de la finca',
    [
      ['🐄', 'Vaca', ['vaca'], 'f'],
      ['🐴', 'Caballo', ['caballo'], 'f'],
      ['🐖', 'Cerdo', ['cerdo', 'chancho', 'puerco', 'cochino'], 'f'],
      ['🐔', 'Gallina', ['gallina', 'gallo', 'pollo'], 'f'],
      ['🐑', 'Oveja', ['oveja', 'borrego'], 'f'],
      ['🐐', 'Cabra', ['cabra'], 'f'],
      ['🦆', 'Pato', ['pato'], 'f']
    ]
  ],
  [
    'ciencias',
    'Plantas y naturaleza',
    [
      ['🌴', 'Palmera', ['palmera', 'palma'], 'f'],
      ['🌻', 'Girasol', ['girasol'], 'f'],
      ['🌵', 'Cactus', ['cactus'], 'f'],
      ['🌳', 'Árbol', ['arbol'], 'f'],
      ['🌹', 'Rosa', ['rosa', 'flor'], 'f'],
      ['🌾', 'Arroz', ['arroz', 'espiga', 'trigo'], 'm'],
      ['🌱', 'Planta', ['planta', 'brote', 'plantita'], 'f'],
      ['🌋', 'Volcán', ['volcan'], 'f'],
      ['🌈', 'Arcoíris', ['arcoiris', 'arco iris'], 'f'],
      ['🌊', 'Ola', ['ola', 'mar', 'oceano'], 'f'],
      ['☀️', 'Sol', ['sol'], 'f'],
      ['🌙', 'Luna', ['luna'], 'f'],
      ['🪐', 'Saturno', ['saturno', 'planeta'], 'd']
    ]
  ],
  [
    'ciencias',
    'Frutas y verduras',
    [
      ['🍍', 'Piña', ['pina'], 'f'],
      ['🍌', 'Banano', ['banano', 'guineo', 'banana'], 'f'],
      ['🥭', 'Mango', ['mango'], 'f'],
      ['🍉', 'Sandía', ['sandia'], 'f'],
      ['🥥', 'Coco', ['coco'], 'f'],
      ['🍊', 'Naranja', ['naranja', 'mandarina'], 'f'],
      ['🍋', 'Limón', ['limon'], 'f'],
      ['🍓', 'Fresa', ['fresa'], 'f'],
      ['🍇', 'Uvas', ['uvas', 'uva'], 'f'],
      ['🥑', 'Aguacate', ['aguacate'], 'm'],
      ['🍅', 'Tomate', ['tomate'], 'f'],
      ['🥕', 'Zanahoria', ['zanahoria'], 'f'],
      ['🌽', 'Maíz', ['maiz', 'elote', 'mazorca'], 'f'],
      ['🥔', 'Papa', ['papa', 'patata'], 'f'],
      ['🧅', 'Cebolla', ['cebolla'], 'm'],
      ['🥦', 'Brócoli', ['brocoli'], 'm']
    ]
  ],
  [
    'cultura',
    'Comidas y bebidas',
    [
      ['☕', 'Café', ['cafe', 'taza de cafe'], 'f'],
      ['🍚', 'Arroz', ['arroz', 'plato de arroz'], 'f'],
      ['🍞', 'Pan', ['pan'], 'f'],
      ['🧀', 'Queso', ['queso'], 'f'],
      ['🥚', 'Huevo', ['huevo'], 'f'],
      ['🥛', 'Leche', ['leche', 'vaso de leche'], 'f'],
      ['🍫', 'Chocolate', ['chocolate', 'cacao'], 'f'],
      ['🍲', 'Sopa', ['sopa', 'olla', 'caldo', 'olla de carne'], 'm'],
      ['🍰', 'Pastel', ['pastel', 'queque', 'torta'], 'f']
    ]
  ],
  [
    'espanol',
    'Objetos del aula',
    [
      ['✏️', 'Lápiz', ['lapiz'], 'f'],
      ['📏', 'Regla', ['regla'], 'f'],
      ['📚', 'Libros', ['libros', 'libro'], 'f'],
      ['🎒', 'Mochila', ['mochila', 'bulto'], 'f'],
      ['✂️', 'Tijeras', ['tijeras', 'tijera'], 'f'],
      ['📎', 'Clip', ['clip', 'gancho', 'sujetapapeles'], 'm'],
      ['🖍️', 'Crayón', ['crayon', 'crayola', 'crayones', 'crayolas'], 'f'],
      ['📐', 'Escuadra', ['escuadra'], 'm'],
      ['🧮', 'Ábaco', ['abaco'], 'm'],
      ['🔔', 'Campana', ['campana', 'timbre'], 'f'],
      ['🪑', 'Silla', ['silla'], 'f'],
      ['🔬', 'Microscopio', ['microscopio'], 'm'],
      ['🗺️', 'Mapa', ['mapa'], 'f'],
      ['🖥️', 'Computadora', ['computadora', 'computador', 'compu', 'pantalla'], 'f'],
      ['📓', 'Cuaderno', ['cuaderno'], 'f']
    ]
  ],
  [
    'sociales',
    'Oficios y profesiones',
    [
      ['👨‍⚕️', 'Doctor', ['doctor', 'doctora', 'medico', 'medica'], 'f'],
      ['👩‍🏫', 'Maestra', ['maestra', 'maestro', 'profesora', 'profesor', 'docente'], 'f'],
      ['👨‍🚒', 'Bombero', ['bombero', 'bombera'], 'f'],
      ['👮', 'Policía', ['policia', 'oficial'], 'f'],
      ['👩‍🌾', 'Agricultora', ['agricultora', 'agricultor', 'campesina', 'campesino'], 'm'],
      ['👨‍🍳', 'Cocinero', ['cocinero', 'cocinera', 'chef'], 'f'],
      ['👷', 'Constructor', ['constructor', 'obrero', 'albanil'], 'm'],
      ['👩‍🔬', 'Científica', ['cientifica', 'cientifico'], 'm'],
      ['👨‍✈️', 'Piloto', ['piloto'], 'm'],
      ['👩‍🎨', 'Artista', ['artista', 'pintora', 'pintor'], 'm'],
      ['👩‍🚀', 'Astronauta', ['astronauta'], 'm']
    ]
  ],
  [
    'sociales',
    'Medios de transporte',
    [
      ['🚌', 'Bus', ['bus', 'autobus'], 'f'],
      ['🚗', 'Carro', ['carro', 'auto', 'coche', 'automovil'], 'f'],
      ['🚲', 'Bicicleta', ['bicicleta', 'bici'], 'f'],
      ['🏍️', 'Moto', ['moto', 'motocicleta'], 'f'],
      ['✈️', 'Avión', ['avion'], 'f'],
      ['🚁', 'Helicóptero', ['helicoptero'], 'f'],
      ['🚢', 'Barco', ['barco', 'buque'], 'f'],
      ['⛵', 'Velero', ['velero', 'barco de vela'], 'm'],
      ['🚂', 'Tren', ['tren', 'locomotora'], 'f'],
      ['🚜', 'Tractor', ['tractor'], 'f'],
      ['🚑', 'Ambulancia', ['ambulancia'], 'f'],
      ['🛶', 'Canoa', ['canoa', 'piragua'], 'm'],
      ['🚀', 'Cohete', ['cohete'], 'f']
    ]
  ],
  [
    'sociales',
    'Lugares y señales',
    [
      ['🏫', 'Escuela', ['escuela', 'colegio'], 'f'],
      ['🏥', 'Hospital', ['hospital', 'clinica'], 'f'],
      ['⛪', 'Iglesia', ['iglesia'], 'f'],
      ['🏠', 'Casa', ['casa', 'hogar'], 'f'],
      ['🏟️', 'Estadio', ['estadio'], 'm'],
      ['🏦', 'Banco', ['banco'], 'm'],
      ['🚦', 'Semáforo', ['semaforo'], 'f'],
      ['🛑', 'Alto', ['alto', 'senal de alto', 'stop', 'pare'], 'f']
    ]
  ],
  [
    'cultura',
    'Deportes',
    [
      ['⚽', 'Fútbol', ['futbol', 'balon', 'pelota'], 'f'],
      ['🏀', 'Baloncesto', ['baloncesto', 'basquetbol', 'basket'], 'f'],
      ['⚾', 'Béisbol', ['beisbol'], 'f'],
      ['🏐', 'Voleibol', ['voleibol', 'volibol', 'voleybol'], 'f'],
      ['🎾', 'Tenis', ['tenis'], 'f'],
      ['🏊', 'Natación', ['natacion', 'nadar'], 'f'],
      ['🚴', 'Ciclismo', ['ciclismo', 'ciclista'], 'm'],
      ['🥋', 'Artes marciales', ['artes marciales', 'karate', 'judo', 'taekwondo'], 'm'],
      ['🏄', 'Surf', ['surf', 'surfear', 'surfista'], 'm'],
      ['🏓', 'Ping pong', ['ping pong', 'tenis de mesa', 'pingpong'], 'm'],
      ['🥊', 'Boxeo', ['boxeo', 'box'], 'm'],
      ['🎳', 'Boliche', ['boliche', 'bolos'], 'm']
    ]
  ],
  [
    'musica',
    'Instrumentos musicales',
    [
      ['🎸', 'Guitarra', ['guitarra'], 'f'],
      ['🥁', 'Tambor', ['tambor', 'bateria'], 'f'],
      ['🎹', 'Piano', ['piano', 'teclado'], 'f'],
      ['🎺', 'Trompeta', ['trompeta'], 'f'],
      ['🎻', 'Violín', ['violin'], 'f'],
      ['🎷', 'Saxofón', ['saxofon', 'saxo'], 'm'],
      ['🪕', 'Banjo', ['banjo'], 'd'],
      ['🎤', 'Micrófono', ['microfono'], 'f'],
      ['🎼', 'Partitura', ['partitura', 'pentagrama'], 'm']
    ]
  ],
  [
    'matematica',
    'Figuras geométricas',
    [
      ['🔵', 'Círculo', ['circulo'], 'f'],
      ['⬛', 'Cuadrado', ['cuadrado'], 'f'],
      ['🔺', 'Triángulo', ['triangulo'], 'f'],
      ['🔶', 'Rombo', ['rombo'], 'm'],
      ['❤️', 'Corazón', ['corazon'], 'f'],
      ['⭐', 'Estrella', ['estrella'], 'f']
    ]
  ],
  [
    'ingles',
    'In English',
    [
      ['🐱', 'Cat', ['cat', 'kitten'], 'f'],
      ['🐶', 'Dog', ['dog', 'puppy'], 'f'],
      ['🍎', 'Apple', ['apple'], 'f'],
      ['🏡', 'House', ['house', 'home'], 'f'],
      ['🐟', 'Fish', ['fish'], 'f'],
      ['🐘', 'Elephant', ['elephant'], 'f'],
      ['🌳', 'Tree', ['tree'], 'f'],
      ['🚗', 'Car', ['car'], 'f'],
      ['🐦', 'Bird', ['bird'], 'f'],
      ['🎂', 'Birthday cake', ['birthday cake', 'cake'], 'm'],
      ['🌧️', 'Rain', ['rain', 'rainy', 'raining'], 'm'],
      ['🦁', 'Lion', ['lion'], 'f'],
      ['🍌', 'Banana', ['banana'], 'f'],
      ['⏰', 'Alarm clock', ['alarm clock', 'clock'], 'm'],
      ['🌟', 'Star', ['star'], 'f'],
      ['🐸', 'Frog', ['frog'], 'f']
    ]
  ]
]

/** Los misterios que vienen con la app */
export const MYSTERIES: Mystery[] = defs.flatMap(([subject, topic, items]) =>
  items.map(([emoji, answer, accepts, tier]) => ({
    id: `${subject}-${topic}-${emoji}`,
    emoji,
    answer,
    accepts: [answer, ...accepts],
    subject,
    topic,
    grades: GRADES[tier]
  }))
)
