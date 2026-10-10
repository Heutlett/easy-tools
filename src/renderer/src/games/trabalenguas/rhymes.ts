import type { Grade } from '../../content/types'
import { pick, pickOne, shuffle } from '../../lib/games/shuffle'

/*
 * Familias de palabras que riman. Cada familia comparte la terminación a partir de la vocal tónica
 * (rima consonante: gato–pato). Las vocales de esa terminación dan la rima asonante: gato (a-o) rima
 * con lado, brazo o barco aunque las consonantes sean distintas.
 * Cada fila: [terminación desde la vocal tónica, grado desde el que se usa, palabras separadas por espacios].
 */
const rows: [string, Grade, string][] = [
  // ───────── Palabras de 1.º ─────────
  ['ato', 1, 'gato pato plato zapato retrato rato barato'],
  ['ado', 1, 'lado dado helado cuidado soldado cansado'],
  ['ano', 1, 'mano hermano verano gusano lejano'],
  ['aro', 2, 'claro raro caro faro'],
  ['asa', 1, 'casa masa pasa brasa tasa'],
  ['ama', 1, 'cama rama llama fama drama pijama'],
  ['ata', 1, 'pata lata bata corbata plata nata'],
  ['ana', 1, 'rana manzana campana ventana mañana semana lana hermana'],
  ['ala', 1, 'ala sala escala regala pala mala'],
  ['aya', 2, 'playa raya vaya atalaya haya'],
  ['aca', 2, 'vaca flaca hamaca estaca casaca'],
  ['ota', 1, 'pelota gota bota nota derrota bellota'],
  ['ola', 1, 'bola ola cola sola caracola amapola'],
  ['osa', 1, 'rosa cosa mariposa hermosa sabrosa preciosa'],
  ['oma', 2, 'loma paloma goma aroma idioma'],
  ['ojo', 2, 'ojo rojo cerrojo antojo enojo'],
  ['oso', 1, 'oso perezoso hermoso sabroso famoso curioso goloso'],
  ['orro', 2, 'gorro zorro cachorro socorro corro'],
  ['oro', 1, 'loro oro tesoro toro coro'],
  ['ono', 2, 'mono tono trono cono'],
  ['oche', 2, 'noche coche broche derroche reproche'],
  ['ente', 2, 'gente mente frente presente diente serpiente caliente fuente puente valiente'],
  ['eso', 2, 'queso beso peso hueso travieso regreso'],
  ['ejo', 2, 'conejo espejo viejo consejo reflejo cangrejo'],
  ['ego', 3, 'fuego juego luego ruego riego'],
  ['elo', 2, 'cielo hielo pelo abuelo vuelo suelo consuelo anzuelo pañuelo'],
  ['eno', 3, 'bueno heno pleno ameno sereno veneno terreno'],
  ['ela', 2, 'vela tela canela acuarela novela escuela abuela muela cazuela'],
  ['eta', 2, 'maleta bicicleta cometa galleta chaqueta libreta trompeta paleta receta planeta'],
  ['esa', 2, 'mesa fresa princesa sorpresa promesa'],
  ['eza', 3, 'belleza riqueza pereza tristeza cabeza grandeza limpieza'],
  ['erra', 3, 'tierra sierra perra'],
  ['erro', 2, 'perro cerro becerro cencerro yerro'],
  ['ema', 3, 'tema poema crema problema sistema'],
  ['eve', 3, 'breve nieve leve lleve llueve mueve'],
  ['ave', 2, 'llave ave suave nave grave clave'],
  ['ante', 3, 'elefante diamante gigante estudiante instante brillante volante'],
  ['alle', 3, 'calle valle detalle talle'],
  ['ase', 3, 'clase base frase pase'],
  ['aje', 3, 'viaje mensaje paisaje garaje equipaje coraje lenguaje'],
  ['orte', 3, 'corte norte transporte deporte soporte aporte'],
  ['ombre', 3, 'hombre nombre'],
  ['ito', 1, 'pito patito gatito bonito chiquito cabrito loquito'],
  ['ino', 2, 'camino pino vecino molino destino vino fino'],
  ['ina', 2, 'cocina vitamina mandarina gallina harina golondrina sardina cortina esquina piscina'],
  [
    'illa',
    1,
    'silla ardilla mejilla rodilla orilla semilla mantequilla tortilla cosquilla pastilla'
  ],
  [
    'illo',
    2,
    'castillo anillo amarillo ladrillo pasillo bolsillo platillo cepillo tobillo membrillo'
  ],
  ['ico', 2, 'pico chico rico mico abanico borrico'],
  ['ido', 2, 'nido vestido perdido sonido dormido querido escondido'],
  ['ilo', 3, 'hilo estilo asilo tranquilo cocodrilo'],
  ['ia', 3, 'día alegría poesía melodía fantasía compañía tía mía valentía'],
  ['una', 1, 'luna cuna aceituna fortuna ninguna laguna tuna'],
  ['uma', 3, 'pluma suma espuma puma bruma'],
  ['ura', 3, 'dulzura ternura altura locura aventura figura criatura pura'],
  ['uta', 3, 'fruta ruta gruta minuta'],
  ['uz', 3, 'luz cruz avestruz'],
  ['ez', 3, 'pez vez rapidez niñez vejez sencillez'],
  ['iz', 3, 'nariz feliz lombriz raíz perdiz cicatriz codorniz'],
  ['ol', 2, 'sol farol girasol caracol tornasol bol'],
  ['or', 2, 'flor color amor calor dolor sabor mayor olor favor tambor motor señor'],
  [
    'on',
    1,
    'ratón balón camión corazón avión melón limón jabón botón cajón canción montón león ladrón'
  ],
  ['in', 3, 'jardín delfín jazmín violín calcetín trampolín fin'],
  ['al', 2, 'sal animal canal real cristal general principal tropical mineral coral portal'],
  ['ar', 1, 'mar cantar bailar jugar saltar nadar pintar volar soñar'],
  ['er', 2, 'comer beber correr leer ver ser hacer querer saber poder'],
  ['ir', 2, 'reír dormir sentir partir vivir subir decir escribir venir salir sonreír'],
  ['ando', 3, 'cantando jugando saltando soñando bailando caminando volando nadando'],
  [
    'ada',
    2,
    'nada ensalada mermelada cañada almohada empanada jornada helada madrugada tostada granada manada cascada'
  ],
  ['ita', 1, 'casita mesita ranita estrellita carita manita'],
  ['aza', 3, 'taza plaza raza calabaza hogaza amenaza'],
  ['azo', 3, 'brazo abrazo plazo lazo pedazo regazo'],
  ['ero', 2, 'sombrero zapatero panadero cartero carnero lucero sendero ligero'],
  ['arco', 3, 'arco barco charco marco'],
  ['anco', 3, 'banco blanco franco flanco'],
  ['ampo', 3, 'campo'],
  ['arte', 4, 'parte arte baluarte'],
  ['ombra', 4, 'sombra alfombra'],
  ['esta', 3, 'fiesta siesta orquesta cuesta respuesta'],
  ['enda', 4, 'tienda leyenda merienda vivienda ofrenda'],
  ['ento', 3, 'viento cuento lento momento cemento invento'],
  ['enta', 4, 'cuenta menta tormenta lenta polenta'],
  ['ancho', 4, 'ancho gancho rancho'],
  ['iño', 3, 'niño cariño armiño guiño'],
  ['ibro', 3, 'libro'],
  ['alma', 4, 'alma palma calma'],
  ['ayo', 4, 'rayo mayo ensayo papagayo'],
  ['ullo', 5, 'capullo orgullo murmullo arrullo'],
  ['oca', 2, 'boca roca foca loca poca'],
  ['osca', 3, 'mosca'],
  ['oja', 3, 'hoja roja'],
  ['ista', 3, 'lista vista pista artista dentista turista'],
  ['inta', 3, 'cinta tinta pinta quinta'],
  ['ida', 2, 'vida comida salida bebida medida corrida despedida'],
  ['adre', 3, 'madre padre'],
  ['ambre', 4, 'hambre alambre'],
  ['ondo', 4, 'fondo hondo redondo'],
  ['undo', 4, 'mundo profundo segundo'],
  ['umo', 4, 'humo consumo'],
  ['evo', 3, 'huevo nuevo longevo'],
  ['igre', 4, 'tigre'],
  ['erde', 4, 'verde'],
  ['ube', 4, 'nube']
]

export interface RhymeFamily {
  key: string
  /** Vocales de la terminación: es la rima asonante */
  assonance: string
  grade: Grade
  words: string[]
}

const strip = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '')

export const families: RhymeFamily[] = rows.map(([key, grade, list]) => ({
  key,
  assonance: strip(key).replace(/[^aeiou]/g, ''),
  grade,
  words: list.split(' ')
}))

export type RhymeKind = 'consonante' | 'asonante'

export interface RhymeItem {
  word: string
  kind: RhymeKind
  options: string[]
  answer: number
  /** Explicación para mostrar al revelar */
  note: string
}

/** Un ítem «¿Cuál rima?» para el grado dado; en 4.º a 6.º también hay rima asonante. */
export function makeRhymeItem(grade: Grade, avoid: string[] = []): RhymeItem {
  const pool = families.filter((f) => f.grade <= grade)
  const assonantMode = grade >= 4 && Math.random() < 0.5
  let target: string
  let correct: string
  let kind: RhymeKind
  let note: string
  let family: RhymeFamily

  for (;;) {
    if (assonantMode) {
      const f = pickOne(pool.filter((x) => x.key.length >= 1))!
      const others = pool.filter((x) => x.assonance === f.assonance && x.key !== f.key)
      if (others.length === 0) continue
      const g = pickOne(others)!
      target = pickOne(f.words)!
      correct = pickOne(g.words)!
      family = f
      kind = 'asonante'
      const vowels = f.assonance.split('').join('-')
      note = `Son rima asonante: solo coinciden las vocales (${vowels}) de «${target}» y «${correct}».`
    } else {
      const f = pickOne(pool.filter((x) => x.words.length >= 2))!
      const two = pick(f.words, 2)
      ;[target, correct] = two
      family = f
      kind = 'consonante'
      note = `Son rima consonante: «${target}» y «${correct}» terminan igual (-${f.key}).`
    }
    if (!avoid.includes(target)) break
  }

  // Tres palabras de familias con otras vocales, para que no rimen ni de lejos
  const distractFamilies = shuffle(pool.filter((f) => f.assonance !== family.assonance))
  const distractors: string[] = []
  const usedAsso = new Set<string>()
  for (const f of distractFamilies) {
    if (distractors.length === 3) break
    const w = pickOne(f.words)!
    if (usedAsso.has(f.key)) continue
    usedAsso.add(f.key)
    distractors.push(w)
  }
  const options = shuffle([correct, ...distractors])
  return { word: target, kind, options, answer: options.indexOf(correct), note }
}
