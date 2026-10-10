import { definePairLists } from '../define'

/**
 * Listas de parejas de INGLÉS para el juego de memoria.
 * Emoji ↔ palabra en inglés, inglés ↔ español, antónimos, singular–plural y verbo–pasado.
 * Vocabulario del programa de Inglés I y II ciclos del MEP (ver questions/ingles.ts).
 */
export default definePairLists('ingles', [
  {
    title: 'Animals (emoji y palabra)',
    grades: [1, 2],
    topic: 'Animales',
    pairs: [
      ['🐶', 'dog'],
      ['🐱', 'cat'],
      ['🐟', 'fish'],
      ['🐦', 'bird'],
      ['🐄', 'cow'],
      ['🐷', 'pig'],
      ['🐴', 'horse'],
      ['🐸', 'frog'],
      ['🐢', 'turtle'],
      ['🐘', 'elephant']
    ]
  },
  {
    title: 'Fruits (emoji y palabra)',
    grades: [1, 2, 3],
    topic: 'Comida',
    pairs: [
      ['🍎', 'apple'],
      ['🍌', 'banana'],
      ['🍇', 'grapes'],
      ['🍉', 'watermelon'],
      ['🍓', 'strawberry'],
      ['🍍', 'pineapple'],
      ['🍋', 'lemon'],
      ['🥭', 'mango']
    ]
  },
  {
    title: 'Food (emoji y palabra)',
    grades: [1, 2, 3],
    topic: 'Comida',
    pairs: [
      ['🍞', 'bread'],
      ['🧀', 'cheese'],
      ['🥚', 'egg'],
      ['🥛', 'milk'],
      ['🍕', 'pizza'],
      ['🎂', 'cake'],
      ['🍪', 'cookie'],
      ['🍚', 'rice']
    ]
  },
  {
    title: 'Colors (círculo y palabra)',
    grades: [1, 2],
    topic: 'Colores y formas',
    pairs: [
      ['🔴', 'red'],
      ['🔵', 'blue'],
      ['🟢', 'green'],
      ['🟡', 'yellow'],
      ['⚫', 'black'],
      ['⚪', 'white'],
      ['🟣', 'purple'],
      ['🟤', 'brown']
    ]
  },
  {
    title: 'School objects (emoji y palabra)',
    grades: [1, 2, 3],
    topic: 'El salón y los útiles',
    pairs: [
      ['✏️', 'pencil'],
      ['📖', 'book'],
      ['✂️', 'scissors'],
      ['🎒', 'backpack'],
      ['📏', 'ruler'],
      ['🪑', 'chair'],
      ['⏰', 'clock'],
      ['🖍️', 'crayon']
    ]
  },
  {
    title: 'Body parts (emoji y palabra)',
    grades: [1, 2],
    topic: 'El cuerpo',
    pairs: [
      ['👂', 'ear'],
      ['👃', 'nose'],
      ['👄', 'mouth'],
      ['👁️', 'eye'],
      ['🦷', 'tooth'],
      ['✋', 'hand'],
      ['🦶', 'foot']
    ]
  },
  {
    title: 'Numbers 1–8 (número y palabra)',
    grades: [1, 2],
    topic: 'Números',
    pairs: [
      ['1', 'one'],
      ['2', 'two'],
      ['3', 'three'],
      ['4', 'four'],
      ['5', 'five'],
      ['6', 'six'],
      ['7', 'seven'],
      ['8', 'eight']
    ]
  },
  {
    title: 'Numbers 11–50 (número y palabra)',
    grades: [2, 3],
    topic: 'Números',
    pairs: [
      ['11', 'eleven'],
      ['12', 'twelve'],
      ['13', 'thirteen'],
      ['14', 'fourteen'],
      ['15', 'fifteen'],
      ['20', 'twenty'],
      ['30', 'thirty'],
      ['50', 'fifty']
    ]
  },
  {
    title: 'First words (inglés y español)',
    grades: [1, 2],
    topic: 'Saludos y sentimientos',
    pairs: [
      ['hello', 'hola'],
      ['goodbye', 'adiós'],
      ['thank you', 'gracias'],
      ['please', 'por favor'],
      ['friend', 'amigo'],
      ['school', 'escuela'],
      ['house', 'casa'],
      ['water', 'agua']
    ]
  },
  {
    title: 'Clothes (emoji y palabra)',
    grades: [2, 3, 4],
    topic: 'Ropa',
    pairs: [
      ['👕', 'shirt'],
      ['👖', 'pants'],
      ['👗', 'dress'],
      ['👟', 'shoes'],
      ['🧢', 'cap'],
      ['🧦', 'socks'],
      ['🧤', 'gloves'],
      ['🩳', 'shorts']
    ]
  },
  {
    title: 'Weather (emoji y palabra)',
    grades: [2, 3, 4],
    topic: 'Clima y estaciones',
    pairs: [
      ['☀️', 'sunny'],
      ['🌧️', 'rainy'],
      ['☁️', 'cloudy'],
      ['💨', 'windy'],
      ['❄️', 'snowy'],
      ['🌈', 'rainbow'],
      ['⚡', 'lightning'],
      ['☔', 'umbrella']
    ]
  },
  {
    title: 'Vehicles (emoji y palabra)',
    grades: [2, 3, 4],
    topic: 'Viajes y planes',
    pairs: [
      ['🚗', 'car'],
      ['🚌', 'bus'],
      ['🚲', 'bicycle'],
      ['✈️', 'airplane'],
      ['🚢', 'ship'],
      ['🚂', 'train'],
      ['🚑', 'ambulance'],
      ['🚜', 'tractor']
    ]
  },
  {
    title: 'Places in town (emoji y palabra)',
    grades: [3, 4],
    topic: 'Lugares y direcciones',
    pairs: [
      ['🏫', 'school'],
      ['🏥', 'hospital'],
      ['🏦', 'bank'],
      ['⛪', 'church'],
      ['🏠', 'house'],
      ['🏖️', 'beach'],
      ['🏨', 'hotel']
    ]
  },
  {
    title: 'Places in town (inglés y español)',
    grades: [3, 4, 5],
    topic: 'Lugares y direcciones',
    pairs: [
      ['library', 'biblioteca'],
      ['bakery', 'panadería'],
      ['pharmacy', 'farmacia'],
      ['market', 'mercado'],
      ['street', 'calle'],
      ['park', 'parque'],
      ['church', 'iglesia'],
      ['bank', 'banco'],
      ['beach', 'playa']
    ]
  },
  {
    title: 'Days of the week (inglés y español)',
    grades: [3, 4],
    topic: 'Fechas y celebraciones',
    pairs: [
      ['Monday', 'lunes'],
      ['Tuesday', 'martes'],
      ['Wednesday', 'miércoles'],
      ['Thursday', 'jueves'],
      ['Friday', 'viernes'],
      ['Saturday', 'sábado'],
      ['Sunday', 'domingo']
    ]
  },
  {
    title: 'Months, first half (inglés y español)',
    grades: [3, 4],
    topic: 'Fechas y celebraciones',
    pairs: [
      ['January', 'enero'],
      ['February', 'febrero'],
      ['March', 'marzo'],
      ['April', 'abril'],
      ['May', 'mayo'],
      ['June', 'junio']
    ]
  },
  {
    title: 'Months, second half (inglés y español)',
    grades: [3, 4],
    topic: 'Fechas y celebraciones',
    pairs: [
      ['July', 'julio'],
      ['August', 'agosto'],
      ['September', 'septiembre'],
      ['October', 'octubre'],
      ['November', 'noviembre'],
      ['December', 'diciembre']
    ]
  },
  {
    title: 'Opposites (antónimos)',
    grades: [3, 4, 5],
    topic: 'Gramática básica',
    pairs: [
      ['big', 'small'],
      ['hot', 'cold'],
      ['fast', 'slow'],
      ['happy', 'sad'],
      ['tall', 'short'],
      ['old', 'new'],
      ['clean', 'dirty'],
      ['day', 'night'],
      ['up', 'down'],
      ['cheap', 'expensive']
    ]
  },
  {
    title: 'Singular and plural (singular y plural)',
    grades: [3, 4, 5],
    topic: 'Gramática básica',
    pairs: [
      ['child', 'children'],
      ['foot', 'feet'],
      ['tooth', 'teeth'],
      ['man', 'men'],
      ['woman', 'women'],
      ['mouse', 'mice'],
      ['person', 'people'],
      ['box', 'boxes'],
      ['dog', 'dogs']
    ]
  },
  {
    title: 'Jobs (inglés y español)',
    grades: [4, 5, 6],
    topic: 'Futuro y planes',
    pairs: [
      ['teacher', 'maestro'],
      ['nurse', 'enfermero'],
      ['farmer', 'agricultor'],
      ['firefighter', 'bombero'],
      ['dentist', 'dentista'],
      ['cook', 'cocinero'],
      ['driver', 'conductor'],
      ['baker', 'panadero']
    ]
  },
  {
    title: 'Technology (inglés y español)',
    grades: [5, 6],
    topic: 'Tecnología',
    pairs: [
      ['screen', 'pantalla'],
      ['keyboard', 'teclado'],
      ['password', 'contraseña'],
      ['mouse', 'ratón'],
      ['download', 'descargar'],
      ['charger', 'cargador'],
      ['headphones', 'audífonos'],
      ['website', 'sitio web']
    ]
  },
  {
    title: 'Present and past (verbo y pasado)',
    grades: [5, 6],
    topic: 'Cuentos y pasado',
    pairs: [
      ['go', 'went'],
      ['eat', 'ate'],
      ['see', 'saw'],
      ['take', 'took'],
      ['give', 'gave'],
      ['write', 'wrote'],
      ['run', 'ran'],
      ['buy', 'bought'],
      ['make', 'made'],
      ['drink', 'drank']
    ]
  },
  {
    title: 'Environment (inglés y español)',
    grades: [5, 6],
    topic: 'Ambiente',
    pairs: [
      ['recycle', 'reciclar'],
      ['reuse', 'reutilizar'],
      ['pollution', 'contaminación'],
      ['forest', 'bosque'],
      ['river', 'río'],
      ['trash', 'basura'],
      ['planet', 'planeta'],
      ['energy', 'energía']
    ]
  }
])
