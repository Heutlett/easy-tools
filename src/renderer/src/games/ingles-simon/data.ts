import type { Grade } from '../../content/types'

/**
 * Órdenes para «Simon says». Vocabulario y estructuras de los escenarios del programa de Inglés de I y II ciclos del MEP (2016):
 * - 1.º: Stand up! Sit down!, open / close your book, partes del cuerpo, útiles escolares, colores, preposiciones in / on / under,
 *   juegos y verbos de acción (jump, run, throw, kick, catch, turn, stop)…
 * - 2.º: hábitos saludables, comida, ropa, animales y sus sonidos, la casa, el clima, números hasta 20.
 * - 3.º: quehaceres, lugares de la comunidad, direcciones (turn left / right, go straight), preposiciones (next to, in front of, behind), pasatiempos.
 * - 4.º a 6.º: salud, desastres naturales, viajes, tecnología, ambiente, cuentos, bosque lluvioso, fiestas y profesiones.
 * Todas se pueden obedecer sentado o parado, sin tocar a otras personas ni mover los pupitres.
 */
export interface Command {
  en: string
  es: string
  grade: Grade
}

const out: Command[] = []
const add = (grade: Grade, en: string, es: string): void => {
  out.push({ en: `${en}.`, es: `${es}.`, grade })
}
const addAll = (grade: Grade, rows: [string, string][]): void =>
  rows.forEach(([en, es]) => add(grade, en, es))

// ───────────── Partes del cuerpo × verbos ─────────────
/** [inglés, español con «tu / tus», grado en que se aprende] */
const BODY: Record<string, [string, Grade]> = {
  head: ['tu cabeza', 1],
  nose: ['tu nariz', 1],
  eyes: ['tus ojos', 1],
  ears: ['tus orejas', 1],
  mouth: ['tu boca', 1],
  hands: ['tus manos', 1],
  arms: ['tus brazos', 1],
  legs: ['tus piernas', 1],
  feet: ['tus pies', 1],
  hair: ['tu cabello', 1],
  fingers: ['tus dedos', 1],
  knees: ['tus rodillas', 1],
  shoulders: ['tus hombros', 1],
  toes: ['los dedos de tus pies', 1],
  tummy: ['tu barriga', 1],
  face: ['tu cara', 2],
  teeth: ['tus dientes', 2],
  neck: ['tu cuello', 2],
  elbows: ['tus codos', 2],
  back: ['tu espalda', 2],
  tongue: ['tu lengua', 2],
  thumbs: ['tus pulgares', 2],
  cheeks: ['tus mejillas', 2],
  chin: ['tu barbilla', 2]
}

const ALL = Object.keys(BODY)
const COVER: Record<string, string> = {
  eyes: 'los ojos',
  ears: 'las orejas',
  mouth: 'la boca',
  nose: 'la nariz',
  face: 'la cara'
}
const BODY_VERBS: { en: string; es: string; grade: Grade; parts: string[] }[] = [
  { en: 'Touch', es: 'Toca', grade: 1, parts: ALL.filter((p) => p !== 'tongue') },
  { en: 'Point to', es: 'Señala', grade: 1, parts: ALL },
  {
    en: 'Shake',
    es: 'Sacude',
    grade: 1,
    parts: ['head', 'hands', 'arms', 'legs', 'feet', 'shoulders', 'fingers']
  },
  { en: 'Wiggle', es: 'Mueve', grade: 1, parts: ['fingers', 'toes', 'ears', 'nose', 'thumbs'] },
  { en: 'Cover', es: 'Cúbrete', grade: 1, parts: ['eyes', 'ears', 'mouth', 'nose', 'face'] },
  {
    en: 'Move',
    es: 'Mueve',
    grade: 1,
    parts: ['arms', 'legs', 'shoulders', 'head', 'feet', 'elbows']
  },
  {
    en: 'Stretch',
    es: 'Estira',
    grade: 2,
    parts: ['arms', 'legs', 'back', 'neck', 'fingers', 'hands']
  },
  {
    en: 'Tap',
    es: 'Golpea suavemente',
    grade: 2,
    parts: ['head', 'knees', 'shoulders', 'tummy', 'feet', 'cheeks', 'chin']
  },
  { en: 'Rub', es: 'Frota', grade: 2, parts: ['tummy', 'hands', 'arms', 'knees', 'cheeks'] },
  { en: 'Scratch', es: 'Rasca', grade: 2, parts: ['head', 'back', 'nose', 'arms', 'knees'] },
  { en: 'Hold', es: 'Agarra', grade: 3, parts: ['ears', 'nose', 'chin', 'elbows', 'feet'] }
]
for (const v of BODY_VERBS)
  for (const p of v.parts) {
    const [es, g] = BODY[p]
    const spanish = v.es === 'Cúbrete' ? `Cúbrete ${COVER[p]}` : `${v.es} ${es}`
    add(Math.max(v.grade, g) as Grade, `${v.en} your ${p}`, spanish)
  }

// ───────────── Útiles y salón ─────────────
/** [inglés, español (sin artículo), grado] */
const PORTABLE: [string, string, Grade][] = [
  ['pencil', 'lápiz', 1],
  ['pen', 'lapicero', 1],
  ['book', 'libro', 1],
  ['notebook', 'cuaderno', 1],
  ['ruler', 'regla', 1],
  ['eraser', 'borrador', 1],
  ['backpack', 'mochila', 1],
  ['glue', 'goma', 1],
  ['scissors', 'tijeras', 1],
  ['marker', 'marcador', 1],
  ['colored pencils', 'lápices de color', 2],
  ['sharpener', 'sacapuntas', 2]
]
const SMALL = PORTABLE.slice(0, 6) // lápiz, lapicero, libro, cuaderno, regla, borrador

const tuya = (en: string, es: string): string =>
  /s$/.test(en) && en !== 'glue' ? `tus ${es}` : `tu ${es}`

for (const [en, es, g] of PORTABLE) {
  add(g, `Hold up your ${en}`, `Levanta ${tuya(en, es)}`)
  if (en !== 'backpack' && en !== 'glue') add(g, `Touch your ${en}`, `Toca ${tuya(en, es)}`)
  add(g, `Point to your ${en}`, `Señala ${tuya(en, es)}`)
}
for (const [en, es] of [
  ['desk', 'pupitre'],
  ['chair', 'silla']
] as const) {
  add(1, `Touch your ${en}`, `Toca tu ${es}`)
  add(1, `Point to your ${en}`, `Señala tu ${es}`)
}
for (const [en, es] of [
  ['door', 'la puerta'],
  ['window', 'la ventana'],
  ['board', 'la pizarra'],
  ['wall', 'la pared'],
  ['floor', 'el piso'],
  ['ceiling', 'el techo'],
  ['table', 'la mesa'],
  ['light', 'la luz']
] as const) {
  add(en === 'ceiling' || en === 'light' ? 2 : 1, `Point to the ${en}`, `Señala ${es}`)
}

// Abrir y cerrar
for (const [en, es] of [
  ['book', 'libro'],
  ['notebook', 'cuaderno'],
  ['backpack', 'mochila']
] as const) {
  add(1, `Open your ${en}`, `Abre tu ${es}`)
  add(1, `Close your ${en}`, `Cierra tu ${es}`)
}

// ───────────── Colores ─────────────
const COLORS: [string, string, Grade][] = [
  ['red', 'rojo', 1],
  ['blue', 'azul', 1],
  ['green', 'verde', 1],
  ['yellow', 'amarillo', 1],
  ['orange', 'anaranjado', 1],
  ['purple', 'morado', 1],
  ['pink', 'rosado', 1],
  ['brown', 'café', 1],
  ['black', 'negro', 1],
  ['white', 'blanco', 1],
  ['gray', 'gris', 2]
]
for (const [en, es, g] of COLORS) {
  add(g, `Touch something ${en}`, `Toca algo de color ${es}`)
  add(g, `Point to something ${en}`, `Señala algo de color ${es}`)
  add(g, `Find something ${en}`, `Busca algo de color ${es}`)
}

// ───────────── Números ─────────────
const NUMBER_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty'
]
const NUMBER_ES = [
  'cero',
  'una',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte'
]
for (let n = 2; n <= 20; n++) {
  const g: Grade = n <= 10 ? 1 : 2
  add(g, `Clap ${NUMBER_WORDS[n]} times`, `Aplaude ${NUMBER_ES[n]} veces`)
  if (n <= 10) add(g, `Jump ${NUMBER_WORDS[n]} times`, `Salta ${NUMBER_ES[n]} veces`)
  if (n <= 10) add(g, `Stomp ${NUMBER_WORDS[n]} times`, `Pisa fuerte ${NUMBER_ES[n]} veces`)
  if (n <= 10) add(g, `Nod ${NUMBER_WORDS[n]} times`, `Asiente con la cabeza ${NUMBER_ES[n]} veces`)
  if (n >= 11)
    add(
      g,
      `Tap your knees ${NUMBER_WORDS[n]} times`,
      `Golpea suavemente tus rodillas ${NUMBER_ES[n]} veces`
    )
}
for (let n = 1; n <= 10; n++)
  add(
    1,
    `Hold up ${NUMBER_WORDS[n]} ${n === 1 ? 'finger' : 'fingers'}`,
    `Levanta ${n === 1 ? 'un dedo' : `${NUMBER_ES[n]} dedos`}`
  )

// ───────────── Preposiciones: Put your … ─────────────
const SPOTS_1: [string, string, string][] = [
  ['on', 'sobre', 'your desk|tu pupitre'],
  ['on', 'sobre', 'your chair|tu silla'],
  ['under', 'debajo de', 'your desk|tu pupitre'],
  ['under', 'debajo de', 'your chair|tu silla'],
  ['in', 'dentro de', 'your backpack|tu mochila']
]
for (const [en, es] of SMALL)
  for (const [prep, prepEs, spot] of SPOTS_1) {
    const [spotEn, spotEs] = spot.split('|')
    const noun = `${es}`
    const poss = tuya(en, noun)
    add(1, `Put your ${en} ${prep} ${spotEn}`, `Pon ${poss} ${prepEs} ${spotEs}`)
  }
for (const [en, es] of [
  ['head', 'tu cabeza'],
  ['nose', 'tu nariz'],
  ['knee', 'tu rodilla'],
  ['shoulder', 'tu hombro'],
  ['tummy', 'tu barriga'],
  ['desk', 'tu pupitre'],
  ['chair', 'tu silla']
] as const)
  add(1, `Put your hand on your ${en}`, `Pon la mano sobre ${es}`)
add(1, 'Put your hand in front of your face', 'Pon la mano frente a tu cara')

// ───────────── Acciones por grado ─────────────
addAll(1, [
  ['Stand up', 'Ponte de pie'],
  ['Sit down', 'Siéntate'],
  ['Clap your hands', 'Aplaude'],
  ['Jump', 'Salta'],
  ['Jump up high', 'Salta bien alto'],
  ['Run in place', 'Corre sin moverte del lugar'],
  ['Walk in place', 'Camina sin moverte del lugar'],
  ['Hop on one foot', 'Salta en un pie'],
  ['Stand on one foot', 'Párate en un pie'],
  ['Turn around', 'Date la vuelta'],
  ['Spin around', 'Gira en tu lugar'],
  ['Wave hello', 'Saluda con la mano'],
  ['Wave goodbye', 'Despídete con la mano'],
  ['Smile', 'Sonríe'],
  ['Dance', 'Baila'],
  ['Sing a song', 'Canta una canción'],
  ['Stop', 'Alto'],
  ['Raise your hand', 'Levanta la mano'],
  ['Raise your arms', 'Levanta los brazos'],
  ['Touch the floor', 'Toca el piso'],
  ['Stretch up high', 'Estírate hacia arriba'],
  ['Close your eyes', 'Cierra los ojos'],
  ['Open your eyes', 'Abre los ojos'],
  ['Open your mouth', 'Abre la boca'],
  ['Close your mouth', 'Cierra la boca'],
  ['Draw a circle in the air', 'Dibuja un círculo en el aire'],
  ['Draw a star in the air', 'Dibuja una estrella en el aire'],
  ['Draw a square in the air', 'Dibuja un cuadrado en el aire'],
  ['Draw a triangle in the air', 'Dibuja un triángulo en el aire'],
  ['Draw a heart in the air', 'Dibuja un corazón en el aire'],
  ['Throw an imaginary ball', 'Lanza una pelota imaginaria'],
  ['Kick an imaginary ball', 'Patea una pelota imaginaria'],
  ['Catch an imaginary ball', 'Atrapa una pelota imaginaria'],
  ['Ride an imaginary bike', 'Anda en una bicicleta imaginaria'],
  ['Jump rope', 'Salta la cuerda'],
  ['Be quiet', 'Haz silencio'],
  ['Listen', 'Escucha'],
  ['Say hello', 'Di hola'],
  ['Say goodbye', 'Di adiós'],
  ['Say thank you', 'Di gracias'],
  ['Say please', 'Di por favor'],
  ['Say your name', 'Di tu nombre'],
  ['Hands up', 'Manos arriba'],
  ['Hands down', 'Manos abajo'],
  ['Turn left', 'Gira a la izquierda'],
  ['Turn right', 'Gira a la derecha'],
  ['Make a circle with your arms', 'Haz un círculo con tus brazos'],
  ['Count to five', 'Cuenta hasta cinco'],
  ['Count to ten', 'Cuenta hasta diez'],
  ['Hug yourself', 'Abrázate'],
  ['Show me your hands', 'Muéstrame tus manos'],
  ['Blink your eyes', 'Parpadea'],
  ['Sit on the floor', 'Siéntate en el piso'],
  ['Walk like a robot', 'Camina como un robot'],
  ['Look happy', 'Pon cara de feliz'],
  ['Look sad', 'Pon cara de triste'],
  ['Look angry', 'Pon cara de enojado'],
  ['Look scared', 'Pon cara de asustado'],
  ['Look tired', 'Pon cara de cansado'],
  ['Look sick', 'Pon cara de enfermo']
])

addAll(2, [
  ['Wash your hands', 'Lávate las manos'],
  ['Brush your teeth', 'Cepíllate los dientes'],
  ['Comb your hair', 'Péinate'],
  ['Take a shower', 'Báñate'],
  ['Drink water', 'Toma agua'],
  ['Drink milk', 'Toma leche'],
  ['Drink juice', 'Toma jugo'],
  ['Eat an apple', 'Come una manzana'],
  ['Eat a banana', 'Come un banano'],
  ['Eat a carrot', 'Come una zanahoria'],
  ['Eat some grapes', 'Come unas uvas'],
  ['Eat a slice of watermelon', 'Come una rebanada de sandía'],
  ['Eat a slice of pizza', 'Come una porción de pizza'],
  ['Eat a cookie', 'Come una galleta'],
  ['Eat an ice cream', 'Come un helado'],
  ['Eat some rice', 'Come un poco de arroz'],
  ['Eat a sandwich', 'Come un sándwich'],
  ['Sleep', 'Duerme'],
  ['Exercise', 'Haz ejercicio'],
  ['Wake up', 'Despiértate'],
  ['Walk like a duck', 'Camina como un pato'],
  ['Jump like a frog', 'Salta como una rana'],
  ['Fly like a bird', 'Vuela como un pájaro'],
  ['Swim like a fish', 'Nada como un pez'],
  ['Roar like a lion', 'Ruge como un león'],
  ['Hop like a rabbit', 'Brinca como un conejo'],
  ['Move like a snake', 'Muévete como una serpiente'],
  ['Walk like an elephant', 'Camina como un elefante'],
  ['Move slowly like a turtle', 'Muévete despacio como una tortuga'],
  ['Climb like a monkey', 'Trepa como un mono'],
  ['Run like a horse', 'Corre como un caballo'],
  ['Meow like a cat', 'Maúlla como un gato'],
  ['Bark like a dog', 'Ladra como un perro'],
  ['Moo like a cow', 'Muge como una vaca'],
  ['Oink like a pig', 'Gruñe como un cerdo'],
  ['Quack like a duck', 'Haz «cuac» como un pato'],
  ['Crow like a rooster', 'Canta como un gallo'],
  ['Buzz like a bee', 'Zumba como una abeja'],
  ['Put on your hat', 'Ponte el sombrero'],
  ['Put on your cap', 'Ponte la gorra'],
  ['Put on your socks', 'Ponte los calcetines'],
  ['Put on your sneakers', 'Ponte los tenis'],
  ['Put on your boots', 'Ponte las botas'],
  ['Put on your sandals', 'Ponte las sandalias'],
  ['Put on your sunglasses', 'Ponte las gafas de sol'],
  ['Put on your raincoat', 'Ponte el impermeable'],
  ['Put on your sweater', 'Ponte el suéter'],
  ['Put on your t-shirt', 'Ponte la camiseta'],
  ['Open your umbrella', 'Abre tu sombrilla'],
  ['Look surprised', 'Pon cara de sorpresa'],
  ['Look excited', 'Pon cara de emoción'],
  ['Show me a happy face', 'Muéstrame una cara feliz'],
  ['Show me a sad face', 'Muéstrame una cara triste'],
  ['Pretend to sit on a sofa', 'Finge que te sientas en un sofá'],
  ['Open the door', 'Abre la puerta'],
  ['Close the door', 'Cierra la puerta'],
  ['Open the window', 'Abre la ventana'],
  ['Close the window', 'Cierra la ventana'],
  ['Turn on the light', 'Enciende la luz'],
  ['Turn off the light', 'Apaga la luz'],
  ['Sweep the floor', 'Barre el piso'],
  ['Cook dinner', 'Cocina la cena'],
  ['Feed the dog', 'Dale de comer al perro'],
  ['Pet the cat', 'Acaricia al gato'],
  ['Fly a kite', 'Vuela una chiringa'],
  ['Smell a flower', 'Huele una flor'],
  ['Climb a tree', 'Sube a un árbol'],
  ['Shiver like it is cold', 'Tiembla como si hiciera frío'],
  ['Fan yourself like it is hot', 'Abánicate como si hiciera calor'],
  ['Swim in the sea', 'Nada en el mar']
])

addAll(3, [
  ['Wash the dishes', 'Lava los platos'],
  ['Make your bed', 'Haz tu cama'],
  ['Take out the trash', 'Saca la basura'],
  ['Clean your room', 'Limpia tu cuarto'],
  ['Water the plants', 'Riega las plantas'],
  ['Fold the clothes', 'Dobla la ropa'],
  ['Wash the clothes', 'Lava la ropa'],
  ['Set the table', 'Pon la mesa'],
  ['Cook rice', 'Cocina arroz'],
  ['Mop the floor', 'Trapea el piso'],
  ['Pay with money', 'Paga con dinero'],
  ['Count your money', 'Cuenta tu dinero'],
  ['Carry a heavy bag', 'Carga una bolsa pesada'],
  ['Try on a shirt', 'Pruébate una camisa'],
  ['Buy some fruit', 'Compra algo de fruta'],
  ['Paint a picture', 'Pinta un cuadro'],
  ['Read a book', 'Lee un libro'],
  ['Play the guitar', 'Toca la guitarra'],
  ['Play the piano', 'Toca el piano'],
  ['Play the drums', 'Toca los tambores'],
  ['Ride a horse', 'Monta a caballo'],
  ['Swim in the pool', 'Nada en la piscina'],
  ['Play basketball', 'Juega baloncesto'],
  ['Play soccer', 'Juega fútbol'],
  ['Play volleyball', 'Juega voleibol'],
  ['Play tennis', 'Juega tenis'],
  ['Ride a skateboard', 'Anda en patineta'],
  ['Watch TV', 'Mira televisión'],
  ['Listen to music', 'Escucha música'],
  ['Turn left', 'Gira a la izquierda'],
  ['Turn right', 'Gira a la derecha'],
  ['Go straight', 'Sigue derecho'],
  ['Stop here', 'Detente aquí'],
  ['Cross the street', 'Cruza la calle'],
  ['Take the bus', 'Toma el bus'],
  ['Walk to the door', 'Camina hacia la puerta'],
  ['Walk to the window', 'Camina hacia la ventana'],
  ['Walk to the board', 'Camina hacia la pizarra'],
  ['Walk to the back of the room', 'Camina hacia el fondo del salón'],
  ['Walk to your chair', 'Camina hacia tu silla'],
  ['Put your hands behind your back', 'Pon las manos detrás de la espalda'],
  ['Put your hands in front of you', 'Pon las manos al frente'],
  ['Put your book in front of you', 'Pon tu libro frente a ti'],
  ['Stand up and sit down', 'Ponte de pie y siéntate'],
  ['Say your name and your age', 'Di tu nombre y tu edad'],
  ['Say your birthday month', 'Di el mes de tu cumpleaños'],
  ['Count to twenty', 'Cuenta hasta veinte'],
  ['Count to thirty', 'Cuenta hasta treinta'],
  ['Point to an imaginary volcano', 'Señala un volcán imaginario'],
  ['Pretend to be a tourist', 'Finge que eres un turista'],
  ['Pretend to take a photo of the class', 'Finge que tomas una foto de la clase'],
  ['Open a box', 'Abre una caja'],
  ['Carry a box', 'Carga una caja'],
  ['Hang up the clothes', 'Cuelga la ropa']
])
for (const n of [2, 3, 4, 5]) {
  add(3, `Take ${NUMBER_WORDS[n]} steps forward`, `Da ${NUMBER_ES[n]} pasos hacia adelante`)
}
for (const [a, ae, b, be] of [
  ['next to', 'al lado de', 'your chair', 'tu silla'],
  ['behind', 'detrás de', 'your chair', 'tu silla'],
  ['in front of', 'frente a', 'your desk', 'tu pupitre'],
  ['next to', 'al lado de', 'the door', 'la puerta'],
  ['next to', 'al lado de', 'the window', 'la ventana'],
  ['near', 'cerca de', 'the board', 'la pizarra'],
  ['near', 'cerca de', 'the door', 'la puerta'],
  ['near', 'cerca de', 'your desk', 'tu pupitre'],
  ['behind', 'detrás de', 'your desk', 'tu pupitre'],
  ['in front of', 'frente a', 'your chair', 'tu silla']
] as const)
  add(3, `Stand ${a} ${b}`, `Párate ${ae} ${be}`)
for (const [en, es] of SMALL)
  for (const [prep, prepEs, spot] of [
    ['next to', 'al lado de', 'your backpack|tu mochila'],
    ['in front of', 'frente a', 'you|ti'],
    ['behind', 'detrás de', 'your backpack|tu mochila']
  ] as const) {
    const [spotEn, spotEs] = spot.split('|')
    add(3, `Put your ${en} ${prep} ${spotEn}`, `Pon ${tuya(en, es)} ${prepEs} ${spotEs}`)
  }
for (const [en, es] of [
  ['hand', 'la mano'],
  ['pencil', 'tu lápiz'],
  ['book', 'tu libro']
] as const)
  add(3, `Put your ${en} on the desk`, `Pon ${es} sobre el pupitre`)
for (const [en, es] of [
  ['hand', 'la mano'],
  ['pencil', 'tu lápiz'],
  ['notebook', 'tu cuaderno']
] as const)
  add(3, `Put your ${en} under the desk`, `Pon ${es} debajo del pupitre`)

// 4.º
addAll(4, [
  ['Open an umbrella', 'Abre una sombrilla'],
  ['Put on your jacket', 'Ponte la chaqueta'],
  ['Put on your gloves', 'Ponte los guantes'],
  ['Put on your scarf', 'Ponte la bufanda'],
  ['Pretend it is raining', 'Finge que está lloviendo'],
  ['Pretend it is windy', 'Finge que hace viento'],
  ['Pretend it is very hot', 'Finge que hace mucho calor'],
  ['Pretend it is very cold', 'Finge que hace mucho frío'],
  ['Wipe your forehead', 'Límpiate la frente'],
  ['Walk like a sloth', 'Camina como un perezoso'],
  ['Fly like a macaw', 'Vuela como una lapa'],
  ['Hop like a frog', 'Brinca como una rana'],
  ['Swim like a turtle', 'Nada como una tortuga'],
  ['Swim like a dolphin', 'Nada como un delfín'],
  ['Walk like a bear', 'Camina como un oso'],
  ['Jump like a kangaroo', 'Salta como un canguro'],
  ['Pretend to ride a horse', 'Finge que montas a caballo'],
  ['Pretend to drive a car', 'Finge que manejas un carro'],
  ['Pretend to fly an airplane', 'Finge que pilotas un avión'],
  ['Pretend to paddle a canoe', 'Finge que remas en una canoa'],
  ['Pretend to climb a mountain', 'Finge que escalas una montaña'],
  ['Pretend to take a photo', 'Finge que tomas una foto'],
  ['Pretend to pack a bag', 'Finge que empacas un bolso'],
  ['Pull a suitcase', 'Jala una maleta'],
  ['Show your ticket', 'Muestra tu boleto'],
  ['Fasten your seat belt', 'Abróchate el cinturón de seguridad'],
  ['Look out the window', 'Mira por la ventana'],
  ['Pretend you have a headache', 'Finge que te duele la cabeza'],
  ['Pretend you have a stomachache', 'Finge que te duele el estómago'],
  ['Cough', 'Tose'],
  ['Sneeze', 'Estornuda'],
  ['Yawn', 'Bosteza'],
  ['Take your temperature', 'Tómate la temperatura'],
  ['Drink some water', 'Toma un poco de agua'],
  ['Run in place for five seconds', 'Corre en el lugar durante cinco segundos'],
  ['Get under your desk', 'Métete debajo de tu pupitre'],
  ['Cover your head with your arms', 'Cúbrete la cabeza con los brazos'],
  ['Stay low', 'Quédate agachado'],
  ['Stay calm', 'Mantén la calma'],
  ['Walk slowly to the door', 'Camina despacio hacia la puerta'],
  ['Pretend to call for help', 'Finge que pides ayuda'],
  ['Milk a cow', 'Ordeña una vaca'],
  ['Plant a seed', 'Siembra una semilla'],
  ['Pick a fruit', 'Recoge una fruta'],
  ['Feed the chickens', 'Dale de comer a las gallinas'],
  ['Drive a tractor', 'Maneja un tractor'],
  ['Wash some vegetables', 'Lava unas verduras'],
  ['Pretend to look through binoculars', 'Finge que miras con binoculares'],
  ['Pretend to see a waterfall', 'Finge que ves una catarata'],
  ['Pretend to hike up a trail', 'Finge que subes por un sendero'],
  ['Pretend to feed a bird', 'Finge que le das de comer a un pájaro'],
  ['Pretend to pick a flower', 'Finge que recoges una flor'],
  ['Pretend to wash your face', 'Finge que te lavas la cara'],
  ['Pretend to take medicine', 'Finge que tomas medicina'],
  ['Pretend to see a rainbow', 'Finge que ves un arcoíris'],
  ['Pretend to cross a river', 'Finge que cruzas un río'],
  ['Rest your head on your hands', 'Apoya la cabeza en las manos'],
  ['Pretend to ride a bus', 'Finge que vas en un bus'],
  ['Brush your hair', 'Cepíllate el cabello']
])
// Órdenes de dos pasos (4.º)
const TWO: [string, string][] = [
  ['clap your hands', 'aplaude'],
  ['jump', 'salta'],
  ['turn around', 'date la vuelta'],
  ['touch your nose', 'toca tu nariz'],
  ['touch your toes', 'toca los dedos de tus pies'],
  ['wave hello', 'saluda con la mano'],
  ['nod your head', 'asiente con la cabeza'],
  ['touch your ears', 'toca tus orejas'],
  ['stand up', 'ponte de pie'],
  ['sit down', 'siéntate']
]
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)
for (let i = 0; i < TWO.length; i++)
  for (const k of [1, 3, 5]) {
    const a = TWO[i]
    const b = TWO[(i + k) % TWO.length]
    if (a[0] === 'stand up' && b[0] === 'sit down') continue
    add(4, `${cap(a[0])} and then ${b[0]}`, `${cap(a[1])} y luego ${b[1]}`)
  }

// 5.º
addAll(5, [
  ['Type on a keyboard', 'Escribe en un teclado'],
  ['Click the mouse', 'Haz clic con el ratón'],
  ['Talk on the phone', 'Habla por teléfono'],
  ['Pretend to take a selfie', 'Finge que te tomas una selfie'],
  ['Send a message', 'Envía un mensaje'],
  ['Charge your phone', 'Carga tu teléfono'],
  ['Turn on the computer', 'Enciende la computadora'],
  ['Turn off the computer', 'Apaga la computadora'],
  ['Wear your headphones', 'Ponte los audífonos'],
  ['Recycle a bottle', 'Recicla una botella'],
  ['Recycle some paper', 'Recicla un poco de papel'],
  ['Plant a tree', 'Siembra un árbol'],
  ['Turn off the light', 'Apaga la luz'],
  ['Pretend to pick up the trash', 'Finge que recoges la basura'],
  ['Put the trash in the trash can', 'Pon la basura en el basurero'],
  ['Save water', 'Ahorra agua'],
  ['Ride a bike', 'Anda en bicicleta'],
  ['Walk to school', 'Camina a la escuela'],
  ['Drink eight glasses of water', 'Toma ocho vasos de agua'],
  ['Eat some vegetables', 'Come algunas verduras'],
  ['Play chess', 'Juega ajedrez'],
  ['Play cards', 'Juega cartas'],
  ['Pretend to throw a basketball', 'Finge que lanzas un balón de baloncesto'],
  ['Pretend to hit a baseball', 'Finge que bateas una pelota de béisbol'],
  ['Pretend to serve a volleyball', 'Finge que sacas en el voleibol'],
  ['Pretend to kick a soccer ball', 'Finge que pateas un balón de fútbol'],
  ['Play the violin', 'Toca el violín'],
  ['Play the trumpet', 'Toca la trompeta'],
  ['Pretend to be a king', 'Finge que eres un rey'],
  ['Pretend to be a queen', 'Finge que eres una reina'],
  ['Pretend to be a dragon', 'Finge que eres un dragón'],
  ['Walk like a giant', 'Camina como un gigante'],
  ['Whisper like a mouse', 'Susurra como un ratón'],
  ['Open a treasure box', 'Abre un cofre del tesoro'],
  ['Knock on the door', 'Toca la puerta'],
  ['Take your notebook out of your backpack', 'Saca tu cuaderno de la mochila'],
  ['Put your pencil in your backpack', 'Pon tu lápiz en la mochila'],
  ['Put your notebook on your desk', 'Pon tu cuaderno sobre el pupitre'],
  ['Stand up and walk to the door', 'Ponte de pie y camina hacia la puerta'],
  ['Walk to the board and touch it', 'Camina hacia la pizarra y tócala'],
  ['Count from one to ten', 'Cuenta de uno a diez'],
  ['Count backwards from five', 'Cuenta hacia atrás desde cinco'],
  ['Spell your name', 'Deletrea tu nombre'],
  ['Name three animals', 'Di el nombre de tres animales'],
  ['Name two colors', 'Di el nombre de dos colores'],
  ['Name four fruits', 'Di el nombre de cuatro frutas'],
  ['Say the days of the week', 'Di los días de la semana'],
  ['Say the months of the year', 'Di los meses del año'],
  ['Say what the weather is like today', 'Di cómo está el clima hoy'],
  ['Play an imaginary guitar', 'Toca una guitarra imaginaria'],
  ['Climb an imaginary rope', 'Sube por una cuerda imaginaria'],
  ['Walk like you are in the rain', 'Camina como si estuvieras bajo la lluvia'],
  ['Pretend to read a story', 'Finge que lees un cuento'],
  ['Pretend to write a letter', 'Finge que escribes una carta']
])
const TWO_B: [string, string][] = [
  ['stand up', 'ponte de pie'],
  ['clap twice', 'aplaude dos veces'],
  ['turn around', 'date la vuelta'],
  ['touch your shoulders', 'toca tus hombros'],
  ['touch your knees', 'toca tus rodillas'],
  ['raise your hands', 'levanta las manos'],
  ['jump three times', 'salta tres veces'],
  ['wave goodbye', 'despídete con la mano'],
  ['say hello', 'di hola'],
  ['touch your head', 'toca tu cabeza'],
  ['sit down', 'siéntate'],
  ['close your eyes', 'cierra los ojos']
]
for (let i = 0; i < TWO_B.length; i++)
  for (const k of [2, 5, 7]) {
    const a = TWO_B[i]
    const b = TWO_B[(i + k) % TWO_B.length]
    if (a[0] === 'sit down' && b[0] === 'stand up') continue
    if (a[0] === 'close your eyes' && b[0] === 'jump three times') continue
    add(5, `${cap(a[0])}, then ${b[0]}`, `${cap(a[1])}, luego ${b[1]}`)
  }

// 6.º
addAll(6, [
  ['Pretend to be a doctor', 'Finge que eres doctor'],
  ['Pretend to be a teacher', 'Finge que eres maestro'],
  ['Pretend to be a pilot', 'Finge que eres piloto'],
  ['Pretend to be an astronaut', 'Finge que eres astronauta'],
  ['Pretend to be a firefighter', 'Finge que eres bombero'],
  ['Pretend to be a farmer', 'Finge que eres agricultor'],
  ['Pretend to be a singer', 'Finge que eres cantante'],
  ['Pretend to be a scientist', 'Finge que eres científico'],
  ['Pretend to be a mechanic', 'Finge que eres mecánico'],
  ['Pretend to be a cook', 'Finge que eres cocinero'],
  ['Pretend to be a police officer', 'Finge que eres oficial de policía'],
  ['Pretend to be a robot', 'Finge que eres un robot'],
  ['Dance like a robot', 'Baila como un robot'],
  ['Walk like a sloth', 'Camina como un perezoso'],
  ['Move like a jaguar', 'Muévete como un jaguar'],
  ['Fly like a toucan', 'Vuela como un tucán'],
  ['Hop like a poison dart frog', 'Brinca como una rana venenosa'],
  ['Climb like a monkey', 'Trepa como un mono'],
  ['Hug a tree', 'Abraza un árbol'],
  ['Plant a tree', 'Siembra un árbol'],
  ['Water a plant', 'Riega una planta'],
  ['Look at the sky', 'Mira el cielo'],
  ['Pretend to collect the trash', 'Finge que juntas la basura'],
  ['Clean the beach', 'Limpia la playa'],
  ['Put the bottles in the recycling bin', 'Pon las botellas en el contenedor de reciclaje'],
  ['Turn off the faucet', 'Cierra la llave del agua'],
  ['Lock your phone', 'Bloquea tu teléfono'],
  ['Close your laptop', 'Cierra tu computadora portátil'],
  ['Show a stop sign with your hand', 'Muestra una señal de alto con la mano'],
  ['Shake your head for no', 'Mueve la cabeza para decir que no'],
  ['Give a thumbs up', 'Levanta el pulgar'],
  ['Hide your password', 'Esconde tu contraseña'],
  ['Blow out the candles', 'Sopla las velas'],
  ['Open a gift', 'Abre un regalo'],
  ['Sing the birthday song', 'Canta la canción de cumpleaños'],
  ['Blow up a balloon', 'Infla un globo'],
  ['Dance to the music', 'Baila con la música'],
  ['Take a bow', 'Haz una reverencia'],
  ['Blow a party horn', 'Sopla un pito de fiesta'],
  ['Hang a decoration', 'Cuelga una decoración'],
  ['Pretend to take a photo of the party', 'Finge que tomas una foto de la fiesta'],
  ['Salute the flag', 'Saluda a la bandera'],
  ['Stand like a hero', 'Párate como un héroe'],
  ['Walk like a soldier', 'Camina como un soldado'],
  ['Beat an imaginary drum', 'Toca un tambor imaginario'],
  ['Shake hands with an imaginary friend', 'Da la mano a un amigo imaginario'],
  ['Show me your dream job', 'Muéstrame tu trabajo soñado'],
  ['Pretend you are on a spaceship', 'Finge que estás en una nave espacial'],
  ['Take a deep breath', 'Respira profundo'],
  ['Count to fifty by tens', 'Cuenta hasta cincuenta de diez en diez'],
  ['Count to twenty by twos', 'Cuenta hasta veinte de dos en dos'],
  ['Spell your last name', 'Deletrea tu apellido'],
  ['Name three jobs', 'Di el nombre de tres trabajos'],
  ['Name three rainforest animals', 'Di el nombre de tres animales del bosque lluvioso'],
  ['Tell me what you will do tomorrow', 'Dime qué harás mañana'],
  ['Tell me what you want to be', 'Dime qué quieres ser']
])
const TRIPLE: [string, string][] = [
  ['stand up', 'ponte de pie'],
  ['clap three times', 'aplaude tres veces'],
  ['turn around', 'date la vuelta'],
  ['touch your toes', 'toca los dedos de tus pies'],
  ['wave hello', 'saluda con la mano'],
  ['jump twice', 'salta dos veces'],
  ['touch your nose', 'toca tu nariz'],
  ['raise your arms', 'levanta los brazos'],
  ['nod your head', 'asiente con la cabeza'],
  ['sit down', 'siéntate']
]
for (let i = 0; i < TRIPLE.length; i++)
  for (const [k1, k2] of [
    [1, 3],
    [2, 5],
    [3, 7],
    [4, 6]
  ]) {
    const a = TRIPLE[i]
    const b = TRIPLE[(i + k1) % TRIPLE.length]
    const c = TRIPLE[(i + k2) % TRIPLE.length]
    if (a[0] === 'sit down' || b[0] === 'stand up' || c[0] === 'stand up') continue
    add(6, `${cap(a[0])}, ${b[0]} and ${c[0]}`, `${cap(a[1])}, ${b[1]} y ${c[1]}`)
  }

/** Todas las órdenes, sin repetir (si una orden sirve para varios grados, queda en el más bajo) */
export const COMMANDS: Command[] = (() => {
  const seen = new Set<string>()
  return [...out]
    .sort((a, b) => a.grade - b.grade)
    .filter((c) => {
      const key = c.en
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
})()

/** Órdenes de un grado; con `review` también las de los grados anteriores */
export function commandsFor(grade: Grade, review: boolean): Command[] {
  return COMMANDS.filter((c) => (review ? c.grade <= grade : c.grade === grade))
}
