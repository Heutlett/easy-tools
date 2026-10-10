import type { Grade } from '../../../content/types'
import type { RuleId } from '../rules'

/** Ejercicio escrito a mano: la primera opción es la correcta */
export interface SentenceItem {
  grade: Grade
  rule: RuleId
  /** Enunciado; si está vacío se pregunta «¿Cuál está bien escrita?». Un ___ marca el espacio por completar */
  prompt: string
  /** Lo que se muestra después de responder */
  why: string
  options: string[]
}

type Row = [Grade, RuleId, string, string, ...string[]]

const make = (rows: Row[]): SentenceItem[] =>
  rows.map(([grade, rule, prompt, why, ...options]) => ({ grade, rule, prompt, why, options }))

const SIGNOS_Q = 'Las preguntas se abren con ¿ y se cierran con ?.'
const SIGNOS_E = 'Las exclamaciones se abren con ¡ y se cierran con !.'
const PUNTO = 'La oración empieza con mayúscula y termina con punto.'
const COMA = 'La coma separa las cosas de una lista; antes de la última se pone y, sin coma.'

export const sentenceItems: SentenceItem[] = make([
  // ───────────────────────── 2.º: signos ─────────────────────────
  [
    2,
    'signos',
    '',
    SIGNOS_Q,
    '¿Cómo te llamas?',
    'Cómo te llamas?',
    '¿Cómo te llamas.',
    'Cómo te llamas.'
  ],
  [
    2,
    'signos',
    '',
    SIGNOS_E,
    '¡Qué bonito día!',
    'Qué bonito día!',
    '¡Qué bonito día.',
    'Qué bonito día.'
  ],
  [2, 'signos', '', SIGNOS_Q, '¿Dónde vives?', 'Dónde vives?', '¿Dónde vives.', 'Dónde vives.'],
  [
    2,
    'signos',
    '',
    SIGNOS_Q,
    '¿Cuántos años tienes?',
    'Cuántos años tienes?',
    '¿Cuántos años tienes.',
    'Cuántos años tienes.'
  ],
  [
    2,
    'signos',
    '',
    SIGNOS_E,
    '¡Feliz cumpleaños!',
    'Feliz cumpleaños!',
    '¡Feliz cumpleaños.',
    'Feliz cumpleaños.'
  ],
  [
    2,
    'signos',
    '',
    SIGNOS_E,
    '¡Cuidado con el perro!',
    'Cuidado con el perro!',
    '¡Cuidado con el perro.',
    'Cuidado con el perro.'
  ],
  [
    2,
    'signos',
    '',
    SIGNOS_Q,
    '¿Quieres jugar conmigo?',
    'Quieres jugar conmigo?',
    '¿Quieres jugar conmigo.',
    'Quieres jugar conmigo.'
  ],
  [2, 'signos', '', SIGNOS_Q, '¿Qué hora es?', 'Qué hora es?', '¿Qué hora es.', 'Qué hora es.'],
  [
    2,
    'signos',
    '',
    SIGNOS_E,
    '¡Gané el juego!',
    'Gané el juego!',
    '¡Gané el juego.',
    'Gané el juego.'
  ],
  [2, 'signos', '', PUNTO, 'Hoy es sábado.', 'hoy es sábado.', 'Hoy es sábado', 'hoy es sábado'],
  [
    2,
    'signos',
    '',
    PUNTO,
    'Mi mamá cocina arroz.',
    'mi mamá cocina arroz.',
    'Mi mamá cocina arroz',
    'mi mamá cocina arroz'
  ],
  [
    2,
    'signos',
    '',
    PUNTO,
    'El gato duerme en la cama.',
    'el gato duerme en la cama.',
    'El gato duerme en la cama',
    'el gato duerme en la cama'
  ],
  [
    2,
    'signos',
    '',
    PUNTO,
    'Me gusta leer cuentos.',
    'me gusta leer cuentos.',
    'Me gusta leer cuentos',
    'me gusta leer cuentos'
  ],
  [
    2,
    'signos',
    '',
    PUNTO,
    'Mañana vamos al parque.',
    'mañana vamos al parque.',
    'Mañana vamos al parque',
    'mañana vamos al parque'
  ],
  [
    2,
    'signos',
    '',
    SIGNOS_Q,
    '¿Cómo estás hoy?',
    'Cómo estás hoy?',
    '¿Cómo estás hoy.',
    'Cómo estás hoy.'
  ],
  [
    2,
    'signos',
    '',
    SIGNOS_E,
    '¡Qué rico huele el pan!',
    'Qué rico huele el pan!',
    '¡Qué rico huele el pan.',
    'Qué rico huele el pan.'
  ],

  // ───────────────────────── 3.º: signos y coma ─────────────────────────
  [
    3,
    'signos',
    '',
    SIGNOS_Q,
    '¿Qué te gusta comer?',
    'Qué te gusta comer?',
    '¿Qué te gusta comer.',
    'Qué te gusta comer.'
  ],
  [
    3,
    'signos',
    '',
    SIGNOS_Q,
    '¿Cuándo es tu cumpleaños?',
    'Cuándo es tu cumpleaños?',
    '¿Cuándo es tu cumpleaños.',
    'Cuándo es tu cumpleaños.'
  ],
  [
    3,
    'signos',
    '',
    SIGNOS_E,
    '¡Auxilio, se cayó el árbol!',
    'Auxilio, se cayó el árbol!',
    '¡Auxilio, se cayó el árbol.',
    'Auxilio, se cayó el árbol.'
  ],
  [
    3,
    'signos',
    '',
    SIGNOS_Q,
    '¿Quién rompió la ventana?',
    'Quién rompió la ventana?',
    '¿Quién rompió la ventana.',
    'Quién rompió la ventana.'
  ],
  [
    3,
    'signos',
    '',
    SIGNOS_E,
    '¡Qué susto me diste!',
    'Qué susto me diste!',
    '¡Qué susto me diste.',
    'Qué susto me diste.'
  ],
  [
    3,
    'signos',
    '',
    COMA,
    'Compré manzanas, peras y uvas.',
    'Compré, manzanas peras y uvas.',
    'Compré manzanas peras, y uvas.',
    'Compré manzanas peras y uvas.'
  ],
  [
    3,
    'signos',
    '',
    COMA,
    'En mi mochila hay lápices, cuadernos y libros.',
    'En mi mochila, hay lápices cuadernos y libros.',
    'En mi mochila hay lápices cuadernos, y libros.',
    'En mi mochila hay lápices cuadernos y libros.'
  ],
  [
    3,
    'signos',
    '',
    COMA,
    'Me gustan el fútbol, el baloncesto y la natación.',
    'Me gustan el fútbol el baloncesto, y la natación.',
    'Me gustan, el fútbol el baloncesto y la natación.',
    'Me gustan el fútbol el baloncesto y la natación.'
  ],
  [
    3,
    'signos',
    '',
    COMA,
    'Vi un tucán, una lapa y un mono.',
    'Vi un tucán una lapa, y un mono.',
    'Vi, un tucán una lapa y un mono.',
    'Vi un tucán una lapa y un mono.'
  ],
  [
    3,
    'signos',
    '',
    COMA,
    'Mi familia viaja a Limón, Cartago y Heredia.',
    'Mi familia viaja a Limón Cartago, y Heredia.',
    'Mi familia, viaja a Limón Cartago y Heredia.',
    'Mi familia viaja a Limón Cartago y Heredia.'
  ],
  [
    3,
    'signos',
    '',
    PUNTO,
    'La escuela abre a las siete.',
    'la escuela abre a las siete.',
    'La escuela abre a las siete',
    'la escuela abre a las siete'
  ],
  [
    3,
    'signos',
    '',
    PUNTO,
    'Mi abuela vive en Cartago.',
    'mi abuela vive en Cartago.',
    'Mi abuela vive en Cartago',
    'mi abuela vive en cartago.'
  ],
  [
    3,
    'signos',
    '',
    SIGNOS_Q,
    '¿Vamos a la playa?',
    'Vamos a la playa?',
    '¿Vamos a la playa.',
    'Vamos a la playa.'
  ],
  [
    3,
    'signos',
    '',
    SIGNOS_E,
    '¡Viva mi equipo!',
    'Viva mi equipo!',
    '¡Viva mi equipo.',
    'Viva mi equipo.'
  ],

  // ───────────────────────── 4.º: signos, coma y punto y coma ─────────────────────────
  [
    4,
    'signos',
    '',
    SIGNOS_Q,
    '¿Por qué lloras, Mateo?',
    'Por qué lloras, Mateo?',
    '¿Por qué lloras Mateo.',
    'Por qué lloras Mateo?'
  ],
  [
    4,
    'signos',
    '',
    'Cuando se nombra a alguien al que se habla, se separa con coma.',
    'Ana, ven acá.',
    'Ana ven acá.',
    'Ana, ven, acá.',
    'Ana ven, acá.'
  ],
  [
    4,
    'signos',
    '',
    'El nombre de la persona a quien se habla se separa con coma.',
    'Gracias, Luis, por tu ayuda.',
    'Gracias Luis por tu ayuda.',
    'Gracias, Luis por tu ayuda.',
    'Gracias Luis, por tu ayuda.'
  ],
  [
    4,
    'signos',
    '',
    COMA,
    'Necesito harina, huevos, azúcar y leche.',
    'Necesito harina huevos, azúcar y leche.',
    'Necesito, harina huevos azúcar y leche.',
    'Necesito harina, huevos, azúcar, y leche.'
  ],
  [
    4,
    'signos',
    '',
    'Antes de «pero» se escribe coma.',
    'Quería salir, pero estaba lloviendo.',
    'Quería salir pero, estaba lloviendo.',
    'Quería, salir pero estaba lloviendo.',
    'Quería salir pero estaba lloviendo,'
  ],
  [
    4,
    'signos',
    '',
    SIGNOS_E,
    '¡Qué hermosa mañana, amigos!',
    'Qué hermosa mañana, amigos!',
    '¡Qué hermosa mañana amigos.',
    '¡Qué hermosa mañana, amigos.'
  ],
  [
    4,
    'signos',
    '',
    SIGNOS_Q,
    '¿Sabes dónde queda el volcán Irazú?',
    'Sabes dónde queda el volcán Irazú?',
    '¿Sabes donde queda el volcán Irazú.',
    'Sabes dónde queda el volcán Irazú.'
  ],
  [
    4,
    'signos',
    '',
    'Cuando alguien habla en un diálogo se usa la raya (—).',
    '—Buenos días —dijo la maestra.',
    'Buenos días dijo la maestra.',
    '—Buenos días dijo la maestra.',
    '-Buenos días- dijo la maestra'
  ],
  [
    4,
    'signos',
    '',
    PUNTO,
    'En diciembre hay muchas fiestas.',
    'en diciembre hay muchas fiestas.',
    'En diciembre hay muchas fiestas',
    'En Diciembre hay muchas fiestas.'
  ],
  [
    4,
    'signos',
    '',
    'Los puntos suspensivos son tres.',
    'Y así fue pasando el tiempo…',
    'Y así fue pasando el tiempo..',
    'Y así fue pasando el tiempo....',
    'Y así fue pasando el tiempo.'
  ],

  // ───────────────────────── 5.º ─────────────────────────
  [
    5,
    'signos',
    '',
    'La coma separa el nombre de la persona a la que nos dirigimos.',
    'Mamá, ¿puedo salir?',
    'Mamá ¿puedo salir?',
    'Mamá, ¿puedo salir.',
    'Mamá, puedo salir?'
  ],
  [
    5,
    'signos',
    '',
    '«Sin embargo» va después de punto y coma y se separa con coma de lo que sigue.',
    'Estudió mucho; sin embargo, no pasó el examen.',
    'Estudió mucho sin embargo no pasó el examen.',
    'Estudió mucho, sin embargo no pasó el examen.',
    'Estudió mucho; sin embargo no pasó el examen.'
  ],
  [
    5,
    'signos',
    '',
    'Una frase que aclara algo va entre comas.',
    'Mi tía Rosa, que vive en Limón, viene mañana.',
    'Mi tía Rosa que vive en Limón viene mañana.',
    'Mi tía Rosa, que vive en Limón viene mañana.',
    'Mi tía, Rosa que vive en Limón, viene mañana.'
  ],
  [
    5,
    'signos',
    '',
    'Cuando el complemento va al principio, se suele separar con coma.',
    'Al llegar a casa, me quité los zapatos.',
    'Al llegar a casa me quité, los zapatos.',
    'Al llegar, a casa me quité los zapatos.',
    'Al llegar a casa me quité los zapatos,'
  ],
  [
    5,
    'signos',
    '',
    SIGNOS_E,
    '¡Qué alegría verte, hermano!',
    'Qué alegría verte, hermano!',
    '¡Qué alegría verte hermano.',
    '¡Qué alegría verte, hermano.'
  ],
  [
    5,
    'signos',
    '',
    SIGNOS_Q,
    '¿Cuántos días faltan para las vacaciones?',
    'Cuántos días faltan para las vacaciones?',
    '¿Cuántos días faltan para las vacaciones.',
    'Cuántos días faltan para las vacaciones.'
  ],
  [
    5,
    'signos',
    '',
    'Los dos puntos van después de la fórmula de saludo en una carta.',
    'Estimado señor director:',
    'Estimado señor director;',
    'Estimado señor director.',
    'Estimado señor director!'
  ],
  [
    5,
    'signos',
    '',
    'El punto y coma separa partes de una oración que ya llevan comas.',
    'Compré frutas, verduras y pan; después fui a casa.',
    'Compré frutas; verduras y pan, después fui a casa.',
    'Compré frutas, verduras y pan: después fui a casa.',
    'Compré frutas verduras y pan; después, fui a casa.'
  ],
  [
    5,
    'signos',
    '',
    'El punto y coma separa dos ideas relacionadas.',
    'Llovió toda la noche; el río creció.',
    'Llovió toda la noche el río; creció.',
    'Llovió toda la noche, el río creció;',
    'Llovió; toda la noche el río creció.'
  ],
  [
    5,
    'signos',
    '',
    'En un diálogo la raya se pone al empezar a hablar cada persona.',
    '—¿Vienes? —preguntó Ana.',
    '—¿Vienes?— preguntó Ana.',
    '¿Vienes? —preguntó Ana.',
    '—¿Vienes? preguntó Ana.'
  ],
  [
    5,
    'signos',
    '',
    'Los puntos suspensivos son tres y dejan la idea abierta.',
    'No sé qué decir…',
    'No sé qué decir..',
    'No sé qué decir....',
    'No sé, qué decir.…'
  ],

  // ───────────────────────── 6.º ─────────────────────────
  [
    6,
    'signos',
    '',
    'Las palabras sin embargo, por lo tanto y en cambio van seguidas de coma.',
    'Hizo calor; por lo tanto, usamos gorra.',
    'Hizo calor por lo tanto usamos gorra.',
    'Hizo calor, por lo tanto usamos gorra.',
    'Hizo calor; por lo tanto usamos, gorra.'
  ],
  [
    6,
    'signos',
    '',
    'Una frase explicativa va entre comas.',
    'Los volcanes, que son montañas, pueden expulsar lava.',
    'Los volcanes que son montañas, pueden expulsar lava.',
    'Los volcanes, que son montañas pueden expulsar lava.',
    'Los volcanes que son montañas pueden expulsar lava.'
  ],
  [
    6,
    'signos',
    '',
    'Los dos puntos se usan antes de una enumeración.',
    'Los colores de la bandera son tres: azul, blanco y rojo.',
    'Los colores de la bandera son tres; azul, blanco y rojo.',
    'Los colores de la bandera son tres, azul: blanco y rojo.',
    'Los colores de la bandera son: tres azul, blanco y rojo.'
  ],
  [
    6,
    'signos',
    '',
    'La coma se usa para separar los elementos de una lista.',
    'Visitamos Tortuguero, Monteverde, Arenal y Poás.',
    'Visitamos Tortuguero Monteverde, Arenal y Poás.',
    'Visitamos, Tortuguero Monteverde, Arenal y Poás.',
    'Visitamos Tortuguero, Monteverde, Arenal, y Poás.'
  ],
  [
    6,
    'signos',
    '',
    'Cuando se interrumpe una oración con una aclaración, se puede usar la raya.',
    'El perezoso —un animal muy lento— duerme casi todo el día.',
    'El perezoso —un animal muy lento duerme casi todo el día.',
    'El perezoso un animal muy lento— duerme casi todo el día.',
    'El perezoso -un animal muy lento- duerme casi todo el día'
  ],
  [
    6,
    'signos',
    '',
    'Las palabras de otra persona pueden ir entre comillas.',
    'El maestro dijo: «Mañana hay examen».',
    'El maestro dijo: «Mañana hay examen.»',
    'El maestro dijo «Mañana hay examen»:',
    'El maestro dijo: Mañana hay examen».'
  ],
  [
    6,
    'signos',
    '',
    SIGNOS_Q,
    '¿Sabes cuántos volcanes activos hay en Costa Rica?',
    'Sabes cuántos volcanes activos hay en Costa Rica?',
    '¿Sabes cuántos volcanes activos hay en Costa Rica.',
    'Sabes cuántos volcanes activos hay en Costa Rica.'
  ],
  [
    6,
    'signos',
    '',
    'La coma separa los elementos de una enumeración.',
    'Necesitamos pegamento, tijeras, papel y marcadores.',
    'Necesitamos pegamento tijeras, papel y marcadores.',
    'Necesitamos, pegamento tijeras papel y marcadores.',
    'Necesitamos pegamento tijeras papel, y marcadores.'
  ],
  [
    6,
    'signos',
    '',
    'Una aclaración al lado del nombre va entre comas.',
    'Juan, el hermano de Marta, juega fútbol.',
    'Juan el hermano de Marta juega fútbol.',
    'Juan, el hermano de Marta juega fútbol.',
    'Juan el hermano, de Marta, juega fútbol.'
  ],
  [
    6,
    'signos',
    '',
    SIGNOS_E,
    '¡Cuánto me alegra que vinieras!',
    'Cuánto me alegra que vinieras!',
    '¡Cuánto me alegra que vinieras.',
    'Cuánto me alegra que vinieras.'
  ],
  [
    6,
    'signos',
    '',
    'Los puntos suspensivos son tres y no llevan punto después.',
    'Dudo que llegue…',
    'Dudo que llegue…..',
    'Dudo que llegue..',
    'Dudo que llegue.…'
  ],

  // ───────────────────────── Palabras que se confunden ─────────────────────────
  [
    4,
    'confusion',
    'Mañana ___ clases en la escuela.',
    '«Hay» es del verbo haber: dice que algo existe. Hay clases.',
    'hay',
    'ahí',
    'ay'
  ],
  [
    4,
    'confusion',
    '¡___, me pegué en el dedo!',
    '«Ay» expresa dolor, sorpresa o pena.',
    'Ay',
    'Hay',
    'Ahí'
  ],
  [
    4,
    'confusion',
    'Pon la mochila ___, sobre la silla.',
    '«Ahí» es un lugar: allí.',
    'ahí',
    'hay',
    'ay'
  ],
  [
    4,
    'confusion',
    '¿Qué ___ dentro de la caja?',
    '«Hay» es del verbo haber: ¿qué existe dentro de la caja?',
    'hay',
    'ahí',
    'ay'
  ],
  [
    4,
    'confusion',
    'Mi cuaderno está ___, encima del pupitre.',
    '«Ahí» indica el lugar donde está algo.',
    'ahí',
    'hay',
    'ay'
  ],
  [
    4,
    'confusion',
    '¡___, qué susto me diste!',
    '«Ay» es una interjección que expresa sorpresa.',
    'Ay',
    'Ahí',
    'Hay'
  ],
  [
    4,
    'confusion',
    'En el parque ___ muchos árboles.',
    'Hay es del verbo haber: existen muchos árboles.',
    'hay',
    'ahí',
    'ay'
  ],
  [
    4,
    'confusion',
    'Vamos ___ la película del sábado.',
    '«A ver» se escribe separado cuando significa mirar o comprobar.',
    'a ver',
    'haber',
    'ha ver'
  ],
  [4, 'confusion', 'Ayer Ana ___ fiebre y no vino.', 'Tuvo es del verbo tener.', 'tuvo', 'tubo'],
  [
    4,
    'confusion',
    'El agua sale por un ___ de plástico.',
    'Tubo es un conducto hueco.',
    'tubo',
    'tuvo'
  ],
  [
    4,
    'confusion',
    'Caminamos ___ la escuela.',
    '«Hacia» indica dirección.',
    'hacia',
    'hacía',
    'asia'
  ],
  [
    4,
    'confusion',
    'Ayer ___ mucho calor.',
    '«Hacía» es del verbo hacer, en pasado.',
    'hacía',
    'hacia',
    'asía'
  ],
  [4, 'confusion', 'Corrimos ___ llegar a la meta.', '«Hasta» indica el límite.', 'hasta', 'asta'],
  [
    4,
    'confusion',
    'La bandera sube por el ___.',
    '«Asta» es el palo de una bandera.',
    'asta',
    'hasta'
  ],
  [
    4,
    'confusion',
    'Una ___ grande llegó a la playa.',
    '«Ola» es el movimiento del agua del mar.',
    'ola',
    'hola'
  ],
  [4, 'confusion', '¡___! ¿Cómo estás?', '«Hola» es un saludo y lleva h.', 'Hola', 'Ola'],
  [
    4,
    'confusion',
    'Bebo mi leche en una ___ blanca.',
    '«Taza» es un recipiente para beber.',
    'taza',
    'tasa'
  ],
  [
    4,
    'confusion',
    'El niño se ___ y escuchó el cuento.',
    '«Calló» viene de callar: no hablar.',
    'calló',
    'cayó'
  ],
  [4, 'confusion', 'El vaso se ___ al piso.', '«Cayó» viene de caer.', 'cayó', 'calló'],
  [4, 'confusion', 'Mi mamá ___ la puerta temprano.', '«Abría» viene de abrir.', 'abría', 'habría'],
  [
    4,
    'confusion',
    'No quiero helado ___ pastel.',
    '«Sino» se usa para corregir lo anterior.',
    'sino',
    'si no'
  ],
  [
    4,
    'confusion',
    'Yo ___ quiero ir al parque.',
    '«También» quiere decir además.',
    'también',
    'tan bien'
  ],
  [
    4,
    'confusion',
    'Mi abuela sabe ___ botones.',
    'Coser es unir con aguja e hilo. Cocer es cocinar.',
    'coser',
    'cocer'
  ],
  [4, 'confusion', 'Mi mamá va a ___ los frijoles.', 'Cocer es cocinar en agua.', 'cocer', 'coser'],
  [
    4,
    'confusion',
    'Los ciudadanos van a ___ el domingo.',
    'Votar es elegir con el voto.',
    'votar',
    'botar'
  ],
  [4, 'confusion', 'No debes ___ basura en la calle.', 'Botar es tirar.', 'botar', 'votar'],

  [
    5,
    'confusion',
    'Voy a ___ si ya llegó mi amigo.',
    '«A ver» se escribe separado cuando significa mirar o comprobar.',
    'a ver',
    'haber'
  ],
  [
    5,
    'confusion',
    'Debe ___ un error en la suma.',
    '«Haber» es el verbo: debe haber, ha de haber.',
    'haber',
    'a ver'
  ],
  [
    5,
    'confusion',
    '¡___ cómo te queda el disfraz!',
    '«A ver» se usa para invitar a mirar.',
    'A ver',
    'Haber'
  ],
  [
    5,
    'confusion',
    'Pudo ___ llegado antes.',
    'Con «pudo», «debe», «puede» se usa el verbo haber.',
    'haber',
    'a ver'
  ],
  [5, 'confusion', 'Ya he ___ mi tarea.', '«Hecho» viene de hacer.', 'hecho', 'echo'],
  [
    5,
    'confusion',
    'Yo ___ agua a las plantas.',
    '«Echo» viene de echar: lanzar o poner.',
    'echo',
    'hecho'
  ],
  [
    5,
    'confusion',
    'Eso es un ___ real, no un cuento.',
    '«Hecho» también es un suceso.',
    'hecho',
    'echo'
  ],
  [
    5,
    'confusion',
    'Voy a ___ las cartas en el buzón.',
    '«Echar» no lleva h: echar agua, echar una carta.',
    'echar',
    'hechar'
  ],
  [
    5,
    'confusion',
    '¡Que le ___ bien en el examen!',
    '«Vaya» viene de ir.',
    'vaya',
    'valla',
    'baya'
  ],
  [
    5,
    'confusion',
    'La ___ del jardín es blanca.',
    '«Valla» es una cerca.',
    'valla',
    'vaya',
    'baya'
  ],
  [
    5,
    'confusion',
    'Esa ___ roja es muy dulce.',
    '«Baya» es un fruto pequeño y carnoso.',
    'baya',
    'vaya',
    'valla'
  ],
  [
    5,
    'confusion',
    'Avísame ___ puedes venir.',
    '«Si no» se escribe separado cuando se puede decir «en caso de que no».',
    'si no',
    'sino'
  ],
  [
    5,
    'confusion',
    '¿___ no viniste a la fiesta?',
    '«Por qué» se escribe separado en las preguntas.',
    'Por qué',
    'Porque',
    'Porqué'
  ],
  [
    5,
    'confusion',
    'No fui ___ estaba enfermo.',
    '«Porque» se usa para dar la causa.',
    'porque',
    'por qué',
    'porqué'
  ],
  [
    5,
    'confusion',
    'No entiendo el ___ de tu enojo.',
    '«Porqué» lleva tilde y significa «el motivo».',
    'porqué',
    'porque',
    'por qué'
  ],
  [
    5,
    'confusion',
    'Ella ___ llegado temprano.',
    '«Ha» es del verbo haber: ha llegado.',
    'ha',
    'a',
    'ah'
  ],
  [
    5,
    'confusion',
    'Voy ___ la escuela.',
    '«A» es una preposición: voy a la escuela.',
    'a',
    'ha',
    'ah'
  ],
  [5, 'confusion', '¡___, ya entiendo!', '«Ah» es una interjección.', 'Ah', 'Ha', 'A'],
  [
    5,
    'confusion',
    'Ojalá ___ sol mañana.',
    '«Haya» es del verbo haber: que haya sol.',
    'haya',
    'halla',
    'allá'
  ],
  [
    5,
    'confusion',
    'Mi tío se ___ en el mercado.',
    '«Halla» viene de hallar: encontrar.',
    'halla',
    'haya',
    'allá'
  ],
  [
    5,
    'confusion',
    'Vivo ___, en esa montaña.',
    '«Allá» es un lugar lejano.',
    'allá',
    'haya',
    'halla'
  ],
  [
    5,
    'confusion',
    'Esta noche voy a ___ una canción.',
    'Grabar es registrar sonidos.',
    'grabar',
    'gravar'
  ],
  [5, 'confusion', 'Voy a ___ un secreto.', 'Revelar es dar a conocer.', 'revelar', 'rebelar'],
  [5, 'confusion', '¡Qué ___ atardecer!', '«Bello» es hermoso.', 'bello', 'vello'],
  [
    5,
    'confusion',
    'Si lloviera, ___ charcos.',
    '«Habría» es del verbo haber: habría charcos.',
    'habría',
    'abría'
  ],
  [5, 'confusion', 'La abuela es muy ___.', '«Sabia» significa que sabe mucho.', 'sabia', 'savia'],
  [
    5,
    'confusion',
    'Los árboles tienen ___, el jugo que los alimenta.',
    '«Savia» es el líquido de las plantas.',
    'savia',
    'sabia'
  ],
  [
    5,
    'confusion',
    'El cazador sale a ___ venados.',
    '«Cazar» es perseguir animales.',
    'cazar',
    'casar'
  ],
  [
    5,
    'confusion',
    'Mi tío se va a ___ en diciembre.',
    '«Casar» es unirse en matrimonio.',
    'casar',
    'cazar'
  ],

  [
    6,
    'confusion',
    'La ___ de los terrenos fue firmada ayer.',
    '«Cesión» viene de ceder: dar.',
    'cesión',
    'sesión'
  ],
  [
    6,
    'confusion',
    'No debes ___ la valla del vecino.',
    '«Rayar» es hacer rayas; «rallar» es desmenuzar.',
    'rayar',
    'rallar'
  ],
  [
    6,
    'confusion',
    'Mi mamá va a ___ queso para la pizza.',
    '«Rallar» es desmenuzar con el rallador.',
    'rallar',
    'rayar'
  ],
  [
    6,
    'confusion',
    'Aún no ___ a casa mi hermano.',
    '«Ha llegado» es del verbo haber (ha = tiene); «a llegado» no se escribe así.',
    'ha llegado',
    'a llegado',
    'ah llegado'
  ],
  [6, 'confusion', '___ así, no me rendí.', '«Aun» sin tilde significa incluso.', 'Aun', 'Aún'],
  [
    6,
    'confusion',
    'Todavía no llega; ___ es temprano.',
    '«Aún» con tilde equivale a todavía.',
    'aún',
    'aun'
  ],
  [6, 'confusion', 'Dejé el abrigo ___ en la silla.', '«Ahí» es un lugar.', 'ahí', 'hay', 'ay'],
  [
    6,
    'confusion',
    'Es importante que ___ paz entre todos.',
    '«Haya» es del verbo haber: que haya paz.',
    'haya',
    'halla',
    'allá'
  ],
  [
    6,
    'confusion',
    'El árbol tiene muchas ___ (frutos pequeños).',
    '«Bayas» son los frutos pequeños.',
    'bayas',
    'vayas',
    'ballas'
  ],
  [
    6,
    'confusion',
    'No quiero que ___ solo al río.',
    '«Vayas» viene de ir.',
    'vayas',
    'bayas',
    'ballas'
  ],
  [
    6,
    'confusion',
    'El ___ paisaje de la montaña se ve desde mi casa.',
    '«Bello» es hermoso; «vello» es pelo fino.',
    'bello',
    'vello'
  ],

  // ───────────────────────── Tilde diacrítica ─────────────────────────
  [
    5,
    'diacritica',
    '___ casa es muy grande.',
    '«Tu» posesivo no lleva tilde: tu casa.',
    'Tu',
    'Tú'
  ],
  [
    5,
    'diacritica',
    '¿___ vienes con nosotros?',
    '«Tú» pronombre lleva tilde: tú vienes.',
    'Tú',
    'Tu'
  ],
  [5, 'diacritica', '___ libro es de Ana.', '«El» artículo no lleva tilde.', 'El', 'Él'],
  [5, 'diacritica', '___ llegó primero a la meta.', '«Él» pronombre lleva tilde.', 'Él', 'El'],
  [5, 'diacritica', 'Este regalo es para ___.', '«Mí» pronombre lleva tilde: para mí.', 'mí', 'mi'],
  [5, 'diacritica', '___ mamá me abrazó.', '«Mi» posesivo no lleva tilde.', 'Mi', 'Mí'],
  [5, 'diacritica', '___ llueve, no salimos.', '«Si» condicional no lleva tilde.', 'Si', 'Sí'],
  [5, 'diacritica', 'Dijo que ___ vendrá a la fiesta.', '«Sí» afirmación lleva tilde.', 'sí', 'si'],
  [
    5,
    'diacritica',
    'Mi abuela toma ___ de manzanilla.',
    '«Té» (la bebida) lleva tilde.',
    'té',
    'te'
  ],
  [5, 'diacritica', '¿___ gusta el helado?', '«Te» pronombre no lleva tilde.', 'Te', 'Té'],
  [5, 'diacritica', 'Quiero ___ agua, por favor.', '«Más» (cantidad) lleva tilde.', 'más', 'mas'],
  [5, 'diacritica', 'Quería ir, ___ no pude.', '«Mas» (pero) no lleva tilde.', 'mas', 'más'],
  [5, 'diacritica', '¿___ hora es?', '«Qué» en preguntas lleva tilde.', 'Qué', 'Que'],
  [
    5,
    'diacritica',
    'Dijo ___ vendría mañana.',
    '«Que» (conecta ideas) no lleva tilde.',
    'que',
    'qué'
  ],
  [5, 'diacritica', '___ nadar muy bien.', '«Sé» (de saber) lleva tilde.', 'Sé', 'Se'],
  [
    5,
    'diacritica',
    'Ana ___ peina frente al espejo.',
    '«Se» pronombre no lleva tilde.',
    'se',
    'sé'
  ],
  [5, 'diacritica', 'El libro es ___ María.', '«De» preposición no lleva tilde.', 'de', 'dé'],
  [5, 'diacritica', 'Quiero que me ___ la mano.', '«Dé» (de dar) lleva tilde.', 'dé', 'de'],
  [5, 'diacritica', 'No sé ___ hacer.', '«Qué» lleva tilde en preguntas indirectas.', 'qué', 'que'],

  [6, 'diacritica', '¿___ te llamas?', '«Cómo» en preguntas lleva tilde.', 'Cómo', 'Como'],
  [
    6,
    'diacritica',
    'Corre ___ el viento.',
    '«Como» en comparaciones no lleva tilde.',
    'como',
    'cómo'
  ],
  [6, 'diacritica', '¿___ vives?', '«Dónde» en preguntas lleva tilde.', 'Dónde', 'Donde'],
  [
    6,
    'diacritica',
    'La casa ___ nací es azul.',
    '«Donde» sin pregunta no lleva tilde.',
    'donde',
    'dónde'
  ],
  [
    6,
    'diacritica',
    '¿___ es tu cumpleaños?',
    '«Cuándo» en preguntas lleva tilde.',
    'Cuándo',
    'Cuando'
  ],
  [
    6,
    'diacritica',
    'Te llamo ___ llegue a casa.',
    '«Cuando» sin pregunta no lleva tilde.',
    'cuando',
    'cuándo'
  ],
  [6, 'diacritica', '¿___ llegó primero?', '«Quién» en preguntas lleva tilde.', 'Quién', 'Quien'],
  [
    6,
    'diacritica',
    'Es ella ___ me ayudó.',
    '«Quien» sin pregunta no lleva tilde.',
    'quien',
    'quién'
  ],
  [
    6,
    'diacritica',
    '¿___ cuesta el pan?',
    '«Cuánto» en preguntas lleva tilde.',
    'Cuánto',
    'Cuanto'
  ],
  [
    6,
    'diacritica',
    'No sabía ___ tiempo faltaba.',
    '«Cuánto» lleva tilde en preguntas indirectas.',
    'cuánto',
    'cuanto'
  ],
  [
    6,
    'diacritica',
    'Cuanto más estudio, ___ aprendo.',
    '«Más» (cantidad) lleva tilde.',
    'más',
    'mas'
  ],
  [
    6,
    'diacritica',
    'No sé ___ decirte.',
    '«Qué» lleva tilde en preguntas indirectas.',
    'qué',
    'que'
  ],
  [
    6,
    'diacritica',
    'Es el libro ___ me prestaste.',
    '«Que» (conecta) no lleva tilde.',
    'que',
    'qué'
  ],
  [6, 'diacritica', 'Quiero ___ leche, por favor.', '«Más» (cantidad) lleva tilde.', 'más', 'mas'],
  [6, 'diacritica', 'Ella ___ tomó un té frío.', '«Se» no lleva tilde.', 'se', 'sé'],
  [
    6,
    'diacritica',
    'Para ___ es importante la lectura.',
    '«Mí» después de preposición lleva tilde.',
    'mí',
    'mi'
  ],
  [6, 'diacritica', 'Me pidió ___ ayuda.', '«Mi» posesivo no lleva tilde.', 'mi', 'mí'],
  [6, 'diacritica', 'No sé ___ ir o quedarme.', '«Si» (duda) no lleva tilde.', 'si', 'sí']
])

/* Mayúsculas: {Nombre} debe ir con mayúscula; [lunes] debe ir con minúscula aunque parezca importante */
export interface CapsSentence {
  grade: Grade
  text: string
}

export const capsSentences: CapsSentence[] = [
  ...[
    'Mi mamá se llama {Ana}.',
    'Mi perro se llama {Max}.',
    'Mi papá se llama {Luis}.',
    'Mi amigo se llama {Pablo}.',
    'Yo vivo en {Costa Rica}.',
    'Mi maestra se llama {Rosa}.',
    'Mi hermana se llama {Sofía}.',
    'Mi gato se llama {Nube}.',
    'Mi abuelo se llama {Carlos}.',
    'Mi amiga se llama {Lía}.'
  ].map((text) => ({ grade: 1 as Grade, text })),
  ...[
    'Mi amiga {Sofía} vive en {San José}.',
    '{Ana} y {Luis} juegan en el parque.',
    'Mi perro se llama {Rocky}.',
    'Mi maestra se llama {Karla}.',
    'Voy a la escuela con {Mateo}.',
    'La escuela de {Valeria} está en {Cartago}.',
    'Mi mamá nació en {Costa Rica}.',
    'El [lunes] voy a la escuela.',
    'Mi cumpleaños es en [marzo].',
    'Mi papá trabaja en {Heredia}.',
    'Mi gato se llama {Tomás}.',
    '{Diego} y yo vamos a {Cartago}.',
    'Mi tía {Rosa} vive en {Limón}.',
    'Mañana visitamos a {Elena}.'
  ].map((text) => ({ grade: 2 as Grade, text })),
  ...[
    'Mi abuela {Carmen} vive en {Alajuela}.',
    'El [sábado] vamos al volcán {Poás}.',
    'En [agosto] celebramos el {Día} de la {Madre}.',
    'El río {Sarapiquí} está en {Heredia}.',
    '{Laura} nació en [julio].',
    'Los [domingos] visito a mi abuelo en {Guanacaste}.',
    'Mi escuela está en {San Ramón}.',
    'El [jueves] jugamos contra la escuela de {Liberia}.',
    'La playa {Jacó} está en {Puntarenas}.',
    '{Pedro} y {María} son mis primos.',
    'En [diciembre] viajamos a {Limón}.',
    'La maestra {Lucía} habla [español] e [inglés].',
    'Mi hermano {Esteban} juega con el equipo de {Cartago}.',
    'El volcán {Irazú} está en la provincia de {Cartago}.'
  ].map((text) => ({ grade: 3 as Grade, text })),
  ...[
    'El [viernes] visitamos la playa de {Tortuguero}.',
    'En [septiembre] celebramos el {Día} de la {Independencia}.',
    'La [costarricense] {Claudia} habla [francés].',
    'El río {Reventazón} nace cerca de {Cartago}.',
    'Mi tío viajó a {México} en [mayo].',
    'Mis amigos {Ana} y {Marco} viven en {Costa Rica}.',
    'La [maestra] {Silvia} enseña [matemática].',
    'El {Teatro Nacional} está en {San José}.',
    'En el mes de [octubre] hay mascaradas en {Barva}.',
    'El [martes] viene el doctor {Rojas} a la escuela.',
    'La [directora] {Patricia} habla con los [niños].',
    'Visitamos el volcán {Arenal} en [enero].',
    'La [familia] {Rodríguez} viene de {Turrialba}.'
  ].map((text) => ({ grade: 4 as Grade, text })),
  ...[
    'El [lunes] vamos al Museo Nacional en {San José}.',
    'Mi amiga {Daniela} nació en {Nicaragua}.',
    'El volcán {Poás} queda cerca de {Alajuela}.',
    'En [noviembre] visitamos la península de {Osa}.',
    'La [cordillera] de {Talamanca} está al sur de {Costa Rica}.',
    'El océano {Pacífico} baña la costa de {Guanacaste}.',
    'El [jueves] viaja el equipo a {Limón}.',
    'En [abril] se celebra el {Día} del {Libro}.',
    'El señor {Ramírez} es [profesor] de [ciencias].',
    'El río {Tempisque} desemboca en el [golfo] de {Nicoya}.',
    'La [maestra] habla con la doctora {Vargas} sobre el [examen].'
  ].map((text) => ({ grade: 5 as Grade, text })),
  ...[
    'En [junio] viajamos a {Monteverde} con la profesora {Salas}.',
    'El {Ministerio} de {Educación} {Pública} está en {San José}.',
    'El océano {Atlántico} baña las costas de {Limón}.',
    'La [presidenta] visitó la {Universidad} de {Costa Rica} en [marzo].',
    'El [domingo] 15 de [septiembre] es el {Día} de la {Independencia}.',
    'El bosque de {Braulio} {Carrillo} está cerca de {San José}.',
    'La [bandera] de {Costa Rica} tiene tres colores.',
    'El [científico] {Clodomiro} {Picado} estudió las serpientes.',
    'En [febrero] florece la guaria morada en {Cartago}.',
    'El doctor {Fernández} habla [portugués] e [inglés].',
    'Los [lunes] practicamos para el desfile de {Quepos}.',
    'La {Biblioteca} {Nacional} tiene muchos [libros].'
  ].map((text) => ({ grade: 6 as Grade, text }))
]
