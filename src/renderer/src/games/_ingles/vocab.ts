import type { Grade } from '../../content/types'

/**
 * Banco de vocabulario ilustrado para los juegos de inglés (¿Qué es?, Escucha y elige…).
 *
 * Vocabulario de los escenarios del programa de Inglés de I y II ciclos del MEP (2016):
 * - Primer ciclo: https://www.mep.go.cr/sites/default/files/media/ingles1ciclo.pdf
 * - Segundo ciclo: https://drea.mep.go.cr/sites/default/files/publicaciones-anexos-2022/ingles2ciclo_nuevo.pdf
 *
 * Reglas del banco (las revisa scripts/validate de _ingles, ver README al final de este archivo):
 * - Cada dibujo (emoji, color, forma o número) representa UNA sola palabra y ninguna palabra se repite.
 * - Solo emojis de Unicode 12 o anteriores (funcionan en Windows 10) y ninguna bandera.
 * - `grade` es el grado en que el programa empieza a usar la palabra; al jugar con un grado se usan las palabras de ese grado y de los anteriores.
 */

/** Cómo se dibuja una palabra: un emoji, un color (`#rrggbb`), una forma (`shape:circle`) o un número (`num:7`) */
export type Visual = string

export interface Word {
  en: string
  es: string
  visual: Visual
  topic: TopicId
  grade: Grade
}

export interface Topic {
  id: TopicId
  en: string
  es: string
  icon: string
}

export const TOPICS = [
  { id: 'colors', en: 'Colors', es: 'Colores', icon: '🎨' },
  { id: 'shapes', en: 'Shapes', es: 'Formas', icon: '🔷' },
  { id: 'numbers', en: 'Numbers', es: 'Números', icon: '🔢' },
  { id: 'pets', en: 'Pets and farm', es: 'Mascotas y granja', icon: '🐶' },
  { id: 'wild', en: 'Wild animals', es: 'Animales salvajes', icon: '🦁' },
  { id: 'bugs', en: 'Bugs', es: 'Bichos', icon: '🐝' },
  { id: 'sea', en: 'Sea animals', es: 'Animales del mar', icon: '🐬' },
  { id: 'fruits', en: 'Fruits', es: 'Frutas', icon: '🍎' },
  { id: 'veggies', en: 'Vegetables', es: 'Verduras', icon: '🥕' },
  { id: 'food', en: 'Food', es: 'Comida', icon: '🍕' },
  { id: 'drinks', en: 'Drinks', es: 'Bebidas', icon: '🥤' },
  { id: 'family', en: 'People', es: 'Personas', icon: '👨‍👩‍👧‍👦' },
  { id: 'body', en: 'Body parts', es: 'Partes del cuerpo', icon: '🖐️' },
  { id: 'feelings', en: 'Feelings', es: 'Sentimientos', icon: '😀' },
  { id: 'school', en: 'School objects', es: 'Objetos de la escuela', icon: '✏️' },
  { id: 'clothes', en: 'Clothes', es: 'Ropa', icon: '👕' },
  { id: 'home', en: 'Home', es: 'Mi casa', icon: '🛏️' },
  { id: 'weather', en: 'Weather', es: 'El clima', icon: '🌦️' },
  { id: 'nature', en: 'Nature', es: 'Naturaleza', icon: '🌳' },
  { id: 'places', en: 'Places', es: 'Lugares', icon: '🏫' },
  { id: 'vehicles', en: 'Transportation', es: 'Transporte', icon: '🚌' },
  { id: 'jobs', en: 'Jobs', es: 'Trabajos', icon: '👨‍⚕️' },
  { id: 'actions', en: 'Actions', es: 'Acciones', icon: '🏃' },
  { id: 'sports', en: 'Sports and games', es: 'Deportes y juegos', icon: '⚽' },
  { id: 'music', en: 'Music and party', es: 'Música y fiestas', icon: '🎸' },
  { id: 'tech', en: 'Technology', es: 'Tecnología', icon: '💻' },
  { id: 'eco', en: 'Environment', es: 'El ambiente', icon: '♻️' }
] as const

export type TopicId = (typeof TOPICS)[number]['id']

type Row = [visual: Visual, en: string, es: string, grade: Grade]

const BANK: Record<TopicId, Row[]> = {
  colors: [
    ['#dc2626', 'red', 'rojo', 1],
    ['#2563eb', 'blue', 'azul', 1],
    ['#16a34a', 'green', 'verde', 1],
    ['#facc15', 'yellow', 'amarillo', 1],
    ['#f97316', 'orange', 'anaranjado', 1],
    ['#9333ea', 'purple', 'morado', 1],
    ['#ec4899', 'pink', 'rosado', 1],
    ['#92400e', 'brown', 'café', 1],
    ['#111827', 'black', 'negro', 1],
    ['#ffffff', 'white', 'blanco', 1],
    ['#9ca3af', 'gray', 'gris', 2]
  ],
  shapes: [
    ['shape:circle', 'circle', 'círculo', 1],
    ['shape:square', 'square', 'cuadrado', 1],
    ['shape:triangle', 'triangle', 'triángulo', 1],
    ['shape:rectangle', 'rectangle', 'rectángulo', 2],
    ['shape:oval', 'oval', 'óvalo', 2],
    ['shape:diamond', 'diamond', 'rombo', 3],
    ['⭐', 'star', 'estrella', 1],
    ['❤️', 'heart', 'corazón', 1]
  ],
  numbers: [
    ['num:1', 'one', 'uno', 1],
    ['num:2', 'two', 'dos', 1],
    ['num:3', 'three', 'tres', 1],
    ['num:4', 'four', 'cuatro', 1],
    ['num:5', 'five', 'cinco', 1],
    ['num:6', 'six', 'seis', 1],
    ['num:7', 'seven', 'siete', 1],
    ['num:8', 'eight', 'ocho', 1],
    ['num:9', 'nine', 'nueve', 1],
    ['num:10', 'ten', 'diez', 1],
    ['num:11', 'eleven', 'once', 2],
    ['num:12', 'twelve', 'doce', 2],
    ['num:13', 'thirteen', 'trece', 2],
    ['num:14', 'fourteen', 'catorce', 2],
    ['num:15', 'fifteen', 'quince', 2],
    ['num:16', 'sixteen', 'dieciséis', 2],
    ['num:17', 'seventeen', 'diecisiete', 2],
    ['num:18', 'eighteen', 'dieciocho', 2],
    ['num:19', 'nineteen', 'diecinueve', 2],
    ['num:20', 'twenty', 'veinte', 2],
    ['num:30', 'thirty', 'treinta', 3],
    ['num:40', 'forty', 'cuarenta', 3],
    ['num:50', 'fifty', 'cincuenta', 3],
    ['num:60', 'sixty', 'sesenta', 3],
    ['num:70', 'seventy', 'setenta', 3],
    ['num:80', 'eighty', 'ochenta', 3],
    ['num:90', 'ninety', 'noventa', 3],
    ['num:100', 'one hundred', 'cien', 3],
    ['num:1st', 'first', 'primero', 4],
    ['num:2nd', 'second', 'segundo', 4],
    ['num:3rd', 'third', 'tercero', 4],
    ['num:4th', 'fourth', 'cuarto', 4],
    ['num:5th', 'fifth', 'quinto', 4],
    ['num:6th', 'sixth', 'sexto', 4]
  ],
  pets: [
    ['🐶', 'dog', 'perro', 1],
    ['🐱', 'cat', 'gato', 1],
    ['🐦', 'bird', 'pájaro', 1],
    ['🐟', 'fish', 'pez', 1],
    ['🐄', 'cow', 'vaca', 1],
    ['🐷', 'pig', 'cerdo', 1],
    ['🐴', 'horse', 'caballo', 1],
    ['🐰', 'rabbit', 'conejo', 1],
    ['🐔', 'hen', 'gallina', 2],
    ['🐓', 'rooster', 'gallo', 2],
    ['🦆', 'duck', 'pato', 2],
    ['🐑', 'sheep', 'oveja', 2],
    ['🐐', 'goat', 'cabra', 2],
    ['🐢', 'turtle', 'tortuga', 2],
    ['🐸', 'frog', 'rana', 1],
    ['🐭', 'mouse', 'ratón', 2],
    ['🦃', 'turkey', 'pavo', 3]
  ],
  wild: [
    ['🦁', 'lion', 'león', 1],
    ['🐯', 'tiger', 'tigre', 1],
    ['🐘', 'elephant', 'elefante', 1],
    ['🐒', 'monkey', 'mono', 1],
    ['🦒', 'giraffe', 'jirafa', 2],
    ['🦓', 'zebra', 'cebra', 2],
    ['🐻', 'bear', 'oso', 2],
    ['🐼', 'panda', 'panda', 2],
    ['🐍', 'snake', 'serpiente', 2],
    ['🐊', 'crocodile', 'cocodrilo', 2],
    ['🦜', 'parrot', 'lora', 2],
    ['🦉', 'owl', 'búho', 3],
    ['🦅', 'eagle', 'águila', 4],
    ['🐺', 'wolf', 'lobo', 4],
    ['🦊', 'fox', 'zorro', 3],
    ['🐨', 'koala', 'koala', 3],
    ['🦘', 'kangaroo', 'canguro', 3],
    ['🐪', 'camel', 'camello', 3],
    ['🦥', 'sloth', 'perezoso', 2],
    ['🦎', 'lizard', 'lagarto', 5],
    ['🦇', 'bat', 'murciélago', 5],
    ['🦌', 'deer', 'venado', 3]
  ],
  bugs: [
    ['🦋', 'butterfly', 'mariposa', 2],
    ['🐝', 'bee', 'abeja', 2],
    ['🐜', 'ant', 'hormiga', 2],
    ['🕷️', 'spider', 'araña', 2],
    ['🐞', 'ladybug', 'mariquita', 3],
    ['🐌', 'snail', 'caracol', 3],
    ['🦟', 'mosquito', 'zancudo', 3],
    ['🐛', 'caterpillar', 'oruga', 3]
  ],
  sea: [
    ['🐙', 'octopus', 'pulpo', 3],
    ['🦈', 'shark', 'tiburón', 3],
    ['🐬', 'dolphin', 'delfín', 3],
    ['🐳', 'whale', 'ballena', 3],
    ['🦀', 'crab', 'cangrejo', 3],
    ['🐠', 'tropical fish', 'pez tropical', 4],
    ['🦑', 'squid', 'calamar', 5],
    ['🦞', 'lobster', 'langosta', 5]
  ],
  fruits: [
    ['🍎', 'apple', 'manzana', 1],
    ['🍌', 'banana', 'banano', 1],
    ['🍇', 'grapes', 'uvas', 1],
    ['🍉', 'watermelon', 'sandía', 1],
    ['🍓', 'strawberry', 'fresa', 1],
    ['🍍', 'pineapple', 'piña', 2],
    ['🍋', 'lemon', 'limón', 2],
    ['🥭', 'mango', 'mango', 2],
    ['🍊', 'orange', 'naranja', 2],
    ['🍑', 'peach', 'durazno', 3],
    ['🍐', 'pear', 'pera', 3],
    ['🍒', 'cherries', 'cerezas', 3],
    ['🥥', 'coconut', 'coco', 2],
    ['🥝', 'kiwi', 'kiwi', 4],
    ['🍈', 'melon', 'melón', 4]
  ],
  veggies: [
    ['🥕', 'carrot', 'zanahoria', 2],
    ['🍅', 'tomato', 'tomate', 2],
    ['🥔', 'potato', 'papa', 2],
    ['🌽', 'corn', 'maíz', 2],
    ['🥦', 'broccoli', 'brócoli', 3],
    ['🥬', 'lettuce', 'lechuga', 3],
    ['🧅', 'onion', 'cebolla', 3],
    ['🧄', 'garlic', 'ajo', 3],
    ['🥒', 'cucumber', 'pepino', 3],
    ['🍆', 'eggplant', 'berenjena', 4],
    ['🍄', 'mushroom', 'hongo', 4],
    ['🌶️', 'chili pepper', 'chile picante', 4]
  ],
  food: [
    ['🍞', 'bread', 'pan', 1],
    ['🧀', 'cheese', 'queso', 1],
    ['🥚', 'egg', 'huevo', 1],
    ['🍕', 'pizza', 'pizza', 1],
    ['🎂', 'cake', 'pastel', 1],
    ['🍪', 'cookie', 'galleta', 1],
    ['🍚', 'rice', 'arroz', 2],
    ['🍔', 'hamburger', 'hamburguesa', 2],
    ['🌭', 'hot dog', 'perro caliente', 2],
    ['🍟', 'french fries', 'papas fritas', 2],
    ['🍦', 'ice cream', 'helado', 1],
    ['🍫', 'chocolate', 'chocolate', 2],
    ['🍬', 'candy', 'dulce', 2],
    ['🍿', 'popcorn', 'palomitas', 3],
    ['🥞', 'pancakes', 'panqueques', 3],
    ['🍗', 'chicken leg', 'muslo de pollo', 2],
    ['🥩', 'meat', 'carne', 2],
    ['🍝', 'spaghetti', 'espagueti', 3],
    ['🌮', 'taco', 'taco', 3],
    ['🥪', 'sandwich', 'sándwich', 2],
    ['🍯', 'honey', 'miel', 3],
    ['🥗', 'salad', 'ensalada', 2],
    ['🍲', 'soup', 'sopa', 3],
    ['🥜', 'peanuts', 'maní', 4]
  ],
  drinks: [
    ['💧', 'water', 'agua', 1],
    ['🥛', 'milk', 'leche', 1],
    ['🧃', 'juice', 'jugo', 1],
    ['☕', 'coffee', 'café (bebida)', 3],
    ['🍵', 'tea', 'té', 3],
    ['🥤', 'soda', 'refresco', 2]
  ],
  family: [
    ['👶', 'baby', 'bebé', 1],
    ['👦', 'boy', 'niño', 1],
    ['👧', 'girl', 'niña', 1],
    ['👨', 'man', 'hombre', 2],
    ['👩', 'woman', 'mujer', 2],
    ['👨‍👩‍👧‍👦', 'family', 'familia', 1]
  ],
  body: [
    ['👁️', 'eye', 'ojo', 1],
    ['👂', 'ear', 'oreja', 1],
    ['👃', 'nose', 'nariz', 1],
    ['👄', 'mouth', 'boca', 1],
    ['👅', 'tongue', 'lengua', 2],
    ['🦷', 'tooth', 'diente', 2],
    ['🖐️', 'hand', 'mano', 1],
    ['🦶', 'foot', 'pie', 1],
    ['🦵', 'leg', 'pierna', 1],
    ['🧠', 'brain', 'cerebro', 3],
    ['🦴', 'bone', 'hueso', 3]
  ],
  feelings: [
    ['😀', 'happy', 'feliz', 1],
    ['😢', 'sad', 'triste', 1],
    ['😠', 'angry', 'enojado', 1],
    ['😨', 'scared', 'asustado', 1],
    ['😲', 'surprised', 'sorprendido', 2],
    ['🤒', 'sick', 'enfermo', 1],
    ['🤩', 'excited', 'emocionado', 2],
    ['😫', 'tired', 'cansado', 1],
    ['😳', 'embarrassed', 'avergonzado', 4]
  ],
  school: [
    ['✏️', 'pencil', 'lápiz', 1],
    ['📖', 'book', 'libro', 1],
    ['📓', 'notebook', 'cuaderno', 1],
    ['📏', 'ruler', 'regla', 1],
    ['✂️', 'scissors', 'tijeras', 1],
    ['🎒', 'backpack', 'mochila', 1],
    ['🖍️', 'crayon', 'crayón', 1],
    ['🖊️', 'pen', 'lapicero', 1],
    ['📎', 'paper clip', 'clip', 3],
    ['🔔', 'bell', 'campana', 3],
    ['🗑️', 'trash can', 'basurero', 2],
    ['🚪', 'door', 'puerta', 1],
    ['🪑', 'chair', 'silla', 1],
    ['🗺️', 'map', 'mapa', 3],
    ['📄', 'paper', 'papel', 2],
    ['🔍', 'magnifying glass', 'lupa', 4],
    ['⏰', 'clock', 'reloj', 2]
  ],
  clothes: [
    ['👕', 't-shirt', 'camiseta', 2],
    ['👖', 'pants', 'pantalón', 2],
    ['👗', 'dress', 'vestido', 2],
    ['👟', 'sneakers', 'zapatos tenis', 2],
    ['🧦', 'socks', 'calcetines', 2],
    ['🧢', 'cap', 'gorra', 2],
    ['👒', 'hat', 'sombrero', 2],
    ['🧥', 'jacket', 'chaqueta', 4],
    ['🧣', 'scarf', 'bufanda', 4],
    ['🧤', 'gloves', 'guantes', 4],
    ['👓', 'glasses', 'anteojos', 3],
    ['🕶️', 'sunglasses', 'gafas de sol', 2],
    ['🩳', 'shorts', 'pantaloneta', 2],
    ['👢', 'boots', 'botas', 2],
    ['👡', 'sandals', 'sandalias', 2],
    ['👜', 'purse', 'cartera', 3],
    ['👔', 'shirt', 'camisa', 3],
    ['🩱', 'swimsuit', 'traje de baño', 2],
    ['🌂', 'umbrella', 'sombrilla', 2],
    ['💍', 'ring', 'anillo', 4]
  ],
  home: [
    ['🛏️', 'bed', 'cama', 2],
    ['🛋️', 'sofa', 'sofá', 2],
    ['🚽', 'toilet', 'inodoro', 2],
    ['🛁', 'bathtub', 'bañera', 2],
    ['🚿', 'shower', 'ducha', 2],
    ['🔑', 'key', 'llave', 3],
    ['🧹', 'broom', 'escoba', 3],
    ['🧼', 'soap', 'jabón', 2],
    ['🧽', 'sponge', 'esponja', 3],
    ['🧺', 'basket', 'canasta', 3],
    ['☎️', 'telephone', 'teléfono', 3],
    ['🥄', 'spoon', 'cuchara', 3],
    ['💡', 'light bulb', 'bombillo', 3],
    ['🕯️', 'candle', 'vela', 4]
  ],
  weather: [
    ['☀️', 'sunny', 'soleado', 2],
    ['☁️', 'cloudy', 'nublado', 2],
    ['🌧️', 'rainy', 'lluvioso', 2],
    ['🌬️', 'windy', 'ventoso', 2],
    ['⛈️', 'stormy', 'con tormenta', 4],
    ['❄️', 'snowy', 'nevado', 4],
    ['🌫️', 'foggy', 'con neblina', 2],
    ['🌈', 'rainbow', 'arcoíris', 2],
    ['⚡', 'lightning', 'rayo', 4],
    ['🥵', 'hot', 'caliente', 2],
    ['🥶', 'cold', 'frío', 2],
    ['🌡️', 'thermometer', 'termómetro', 4],
    ['🌪️', 'tornado', 'tornado', 4],
    ['🌀', 'hurricane', 'huracán', 4]
  ],
  nature: [
    ['🌳', 'tree', 'árbol', 2],
    ['🌲', 'pine tree', 'pino', 4],
    ['🌴', 'palm tree', 'palmera', 2],
    ['🌹', 'rose', 'rosa', 2],
    ['🌻', 'sunflower', 'girasol', 2],
    ['🌷', 'tulip', 'tulipán', 3],
    ['🌼', 'flower', 'flor', 2],
    ['🍃', 'leaf', 'hoja', 2],
    ['🌱', 'plant', 'planta', 2],
    ['🌵', 'cactus', 'cactus', 3],
    ['⛰️', 'mountain', 'montaña', 2],
    ['🏖️', 'beach', 'playa', 2],
    ['🌊', 'wave', 'ola', 3],
    ['🏝️', 'island', 'isla', 3],
    ['🌋', 'volcano', 'volcán', 2],
    ['🌙', 'moon', 'luna', 2],
    ['🌎', 'Earth', 'Tierra', 2],
    ['🔥', 'fire', 'fuego', 3],
    ['🏜️', 'desert', 'desierto', 4]
  ],
  places: [
    ['🏫', 'school', 'escuela', 1],
    ['🏥', 'hospital', 'hospital', 1],
    ['🏦', 'bank', 'banco', 1],
    ['🏪', 'store', 'tienda', 1],
    ['🏨', 'hotel', 'hotel', 3],
    ['⛪', 'church', 'iglesia', 1],
    ['🏠', 'house', 'casa', 1],
    ['🏢', 'office building', 'edificio de oficinas', 3],
    ['🏰', 'castle', 'castillo', 4],
    ['🏭', 'factory', 'fábrica', 4],
    ['🏟️', 'stadium', 'estadio', 3],
    ['⛽', 'gas station', 'gasolinera', 3],
    ['🚏', 'bus stop', 'parada de bus', 3],
    ['🌉', 'bridge', 'puente', 3],
    ['🏤', 'post office', 'correo', 3],
    ['⛺', 'tent', 'tienda de campaña', 3],
    ['🏙️', 'city', 'ciudad', 3],
    ['🏘️', 'town', 'pueblo', 3],
    ['🏞️', 'park', 'parque', 1]
  ],
  vehicles: [
    ['🚗', 'car', 'carro', 1],
    ['🚌', 'bus', 'bus', 1],
    ['🚲', 'bike', 'bicicleta', 1],
    ['🚕', 'taxi', 'taxi', 2],
    ['🚂', 'train', 'tren', 2],
    ['✈️', 'airplane', 'avión', 2],
    ['🚢', 'ship', 'barco grande', 3],
    ['⛵', 'sailboat', 'velero', 3],
    ['🚁', 'helicopter', 'helicóptero', 3],
    ['🚑', 'ambulance', 'ambulancia', 3],
    ['🚒', 'fire truck', 'camión de bomberos', 3],
    ['🚓', 'police car', 'patrulla', 3],
    ['🚚', 'truck', 'camión', 3],
    ['🏍️', 'motorcycle', 'motocicleta', 3],
    ['🚜', 'tractor', 'tractor', 4],
    ['🚀', 'rocket', 'cohete', 4],
    ['🛶', 'canoe', 'canoa', 4]
  ],
  jobs: [
    ['👨‍⚕️', 'doctor', 'doctor', 1],
    ['👩‍🏫', 'teacher', 'maestra', 1],
    ['👨‍🍳', 'cook', 'cocinero', 1],
    ['👨‍🚒', 'firefighter', 'bombero', 1],
    ['👮', 'police officer', 'oficial de policía', 1],
    ['👨‍🌾', 'farmer', 'agricultor', 1],
    ['👷', 'construction worker', 'obrero de construcción', 3],
    ['👨‍✈️', 'pilot', 'piloto', 3],
    ['👨‍🎨', 'artist', 'artista', 3],
    ['👨‍🔧', 'mechanic', 'mecánico', 3],
    ['👨‍🚀', 'astronaut', 'astronauta', 4],
    ['👨‍🔬', 'scientist', 'científico', 4],
    ['👨‍🎤', 'singer', 'cantante', 3],
    ['👨‍🎓', 'student', 'estudiante', 1]
  ],
  actions: [
    ['🏃', 'run', 'correr', 1],
    ['🚶', 'walk', 'caminar', 1],
    ['💃', 'dance', 'bailar', 1],
    ['🏊', 'swim', 'nadar', 1],
    ['🚴', 'ride a bike', 'andar en bicicleta', 1],
    ['🎤', 'sing', 'cantar', 1],
    ['✍️', 'write', 'escribir', 1],
    ['🎨', 'paint', 'pintar', 2],
    ['👏', 'clap', 'aplaudir', 1],
    ['👋', 'wave hello', 'saludar con la mano', 1],
    ['🎣', 'go fishing', 'ir a pescar', 3],
    ['🛌', 'sleep', 'dormir', 2],
    ['🤔', 'think', 'pensar', 2],
    ['😂', 'laugh', 'reír', 2]
  ],
  sports: [
    ['⚽', 'soccer', 'fútbol', 1],
    ['🏀', 'basketball', 'baloncesto', 2],
    ['⚾', 'baseball', 'béisbol', 3],
    ['🏐', 'volleyball', 'voleibol', 2],
    ['🎾', 'tennis', 'tenis', 3],
    ['🏓', 'ping pong', 'ping pong', 4],
    ['🥋', 'karate', 'karate', 4],
    ['🛹', 'skateboard', 'patineta', 3],
    ['🪁', 'kite', 'chiringa', 2],
    ['🎲', 'dice', 'dados', 3],
    ['🧩', 'puzzle', 'rompecabezas', 3],
    ['♟️', 'chess', 'ajedrez', 4],
    ['🧸', 'teddy bear', 'osito de peluche', 2],
    ['🎮', 'video game', 'videojuego', 3],
    ['🏆', 'trophy', 'trofeo', 3],
    ['🎳', 'bowling', 'boliche', 4]
  ],
  music: [
    ['🎸', 'guitar', 'guitarra', 3],
    ['🎹', 'piano', 'piano', 3],
    ['🥁', 'drum', 'tambor', 3],
    ['🎻', 'violin', 'violín', 4],
    ['🎺', 'trumpet', 'trompeta', 4],
    ['🎷', 'saxophone', 'saxofón', 5],
    ['🎵', 'music', 'música', 2],
    ['🎈', 'balloon', 'globo', 2],
    ['🎁', 'gift', 'regalo', 3],
    ['🎉', 'party', 'fiesta', 3],
    ['🎆', 'fireworks', 'fuegos artificiales', 6],
    ['🎄', 'Christmas tree', 'árbol de Navidad', 6]
  ],
  tech: [
    ['💻', 'laptop', 'computadora portátil', 5],
    ['🖱️', 'computer mouse', 'ratón de computadora', 5],
    ['⌨️', 'keyboard', 'teclado', 5],
    ['🖨️', 'printer', 'impresora', 5],
    ['📱', 'cell phone', 'teléfono celular', 5],
    ['📷', 'camera', 'cámara', 5],
    ['🎧', 'headphones', 'audífonos', 5],
    ['📺', 'TV', 'televisor', 3],
    ['📻', 'radio', 'radio', 4],
    ['🔋', 'battery', 'batería', 5],
    ['🔌', 'plug', 'enchufe', 5],
    ['📧', 'e-mail', 'correo electrónico', 5],
    ['🔒', 'lock', 'candado', 6],
    ['🤖', 'robot', 'robot', 5],
    ['🔗', 'link', 'enlace', 6]
  ],
  eco: [
    ['♻️', 'recycle', 'reciclar', 5],
    ['🥫', 'can', 'lata', 6],
    ['📰', 'newspaper', 'periódico', 6],
    ['🛍️', 'shopping bags', 'bolsas de compras', 6]
  ]
}

export const WORDS: Word[] = (Object.entries(BANK) as [TopicId, Row[]][]).flatMap(([topic, rows]) =>
  rows.map(([visual, en, es, grade]) => ({ en, es, visual, topic, grade }))
)

/** Temas que tienen palabras hasta cierto grado, en el orden de TOPICS */
export function topicsForGrade(grade: Grade): Topic[] {
  return TOPICS.filter((t) => WORDS.some((w) => w.topic === t.id && w.grade <= grade))
}

/** Palabras de un grado (y de los anteriores) para los temas elegidos (todos si no se elige ninguno) */
export function wordsFor(grade: Grade, topics: TopicId[]): Word[] {
  return WORDS.filter((w) => w.grade <= grade && (topics.length === 0 || topics.includes(w.topic)))
}
