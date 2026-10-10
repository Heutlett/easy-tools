import type { Grade } from '../../content/types'

/**
 * Listas para «Palabras relámpago». Cada lista dice para qué grados sirve.
 * Las palabras de 2, 3 y 4 o más sílabas están separadas por grado; las «inventadas» son palabras que no existen
 * (se pueden leer, pero no significan nada) para practicar la lectura sin adivinar.
 */
export type KindId = 'dos' | 'tres' | 'largas' | 'dificiles' | 'inventadas' | 'frases'

export interface Kind {
  id: KindId
  title: string
  icon: string
  /** Texto corto que aclara el contenido */
  hint: string
}

export const KINDS: Kind[] = [
  { id: 'dos', title: 'De 2 sílabas', icon: '2️⃣', hint: 'casa, gato, libro' },
  { id: 'tres', title: 'De 3 sílabas', icon: '3️⃣', hint: 'tomate, ventana' },
  { id: 'largas', title: 'Largas', icon: '🐛', hint: '4 o más sílabas' },
  { id: 'dificiles', title: 'Letras difíciles', icon: '🔤', hint: 'rr, ll, ñ, ch, gue, gui' },
  { id: 'inventadas', title: 'Inventadas', icon: '🤪', hint: 'mipa, tufi, dolu' },
  { id: 'frases', title: 'Frases cortas', icon: '💬', hint: 'oraciones cortas' }
]

export interface WordSet {
  kind: KindId
  grades: Grade[]
  items: string[]
}

const w = (text: string): string[] => text.split(/[\s,]+/).filter(Boolean)

export const SETS: WordSet[] = [
  {
    kind: 'dos',
    grades: [1],
    items:
      w(`mesa casa pato gato mano sapo luna mono pelo rama sopa lapa mapa pila nido pino vaso rosa lobo
      nube cama copa dado dedo foca goma hoja isla lana lata lima mula pala pera piso rata sala tela toro uva
      vela vaca lupa pata nota suma boca cara cola cuna gota jugo mora moto ola oso palo papa pico puma roca
      ropa seda taza tubo vida`)
  },
  {
    kind: 'dos',
    grades: [2, 3],
    items:
      w(`tambor puente camión jardín árbol balón flores playa cielo nieve fuego huevo tierra plato libro
      lápiz carta rueda globo barco perro fruta queso leche tigre cebra verde blanco negro grande chico
      mundo tiempo canción lindo dulce fuerte campo calle pueblo ciudad siempre tarde noche cuento viento
      puerta gallo pollo`)
  },
  {
    kind: 'tres',
    grades: [1, 2],
    items:
      w(`banana ventana galleta camisa tomate pelota zapato paloma conejo abeja tortuga gallina caballo
      ardilla semilla cocina cometa bandera manzana naranja pijama sábado domingo camino cerezo tijeras
      cuaderno escuela familia amigo amiga abuela abuelo hermano hermana mañana canasta cuchara silbato
      payaso caracol lechuga`)
  },
  {
    kind: 'tres',
    grades: [3, 4],
    items:
      w(`alegre bonito rápido difícil música pájaro plátano hormiga cangrejo pingüino iguana volcanes
      montaña cascada colibrí venado lagarto amistad libertad pregunta respuesta lectura escribir palabra
      oración problema respeto paciencia maestra maestro`)
  },
  {
    kind: 'largas',
    grades: [3, 4, 5, 6],
    items:
      w(`mariposa elefante bicicleta ferrocarril hipopótamo computadora refrigerador electricidad
      biblioteca calendario geografía televisión universidad naturaleza alimentación cocodrilo mariquita
      vegetación democracia independencia contaminación presidente celebración comunidad mamífero
      murciélago orquídea fotografía pasatiempo matemática diccionario aventura maravilloso ecosistema
      biodiversidad reciclaje conservación costarricense guanacasteco`)
  },
  {
    kind: 'dificiles',
    grades: [1, 2],
    items:
      w(`perro carro torre barro llave silla calle pollo gallo niña piña uña año araña leche noche coche
      ficha chile queso parque guitarra guerra águila hormiga hueso huevo zorro taza cereza cena cine gente
      gigante jirafa ojo yema llorar lluvia ñame montaña mañana cabeza cielo paraguas agua quince queque
      chayote chancho chiquito`)
  },
  {
    kind: 'dificiles',
    grades: [3, 4, 5, 6],
    items:
      w(`chimpancé guepardo pingüino ñandú orquídea exámenes xilófono ciempiés jaguar guerrero cigüeña
      vergüenza yegua yuca zanahoria hielo hoyo huerta hierba ahorro almohada desayuno rayo reyes cuchillo
      gorrión carretera terremoto guirnalda campeón`)
  },
  {
    kind: 'inventadas',
    grades: [1, 2],
    items:
      w(`mipa tufi dolu nesi mifa rafu zuta jopi vune bupe fesu sefi lonu pumi dami fupo sipu jemu bafi
      nupe rimu mepa tamu venu pilu lefo sumi`)
  },
  {
    kind: 'inventadas',
    grades: [3, 4, 5, 6],
    items:
      w(`mitapo solume panute nudila bafesi relumo gatipo dofena lirano tomelu pesuma cafule munapi
      sedoli jarupe futena valomi tipuro brapo plime glufa trasi clemo frupe blina crodi lumpa dasco fenta
      pirso morbe tuncha`)
  },
  {
    kind: 'frases',
    grades: [1],
    items: [
      'Mi mamá me ama.',
      'El gato duerme.',
      'La rana salta.',
      'El sapo come.',
      'Mi papá lee.',
      'La luna sale.',
      'El pato nada.',
      'Mi casa es bonita.',
      'El sol brilla.',
      'La niña ríe.',
      'El niño come pan.',
      'Mi perro corre.',
      'La vaca come pasto.',
      'El oso come miel.',
      'El mono sube.',
      'Papá toma café.',
      'La pelota rueda.',
      'Mi amigo juega.',
      'El pez nada.',
      'Yo leo un libro.',
      'Mi tía canta.',
      'La rosa es roja.'
    ]
  },
  {
    kind: 'frases',
    grades: [2],
    items: [
      'Mi escuela es bonita.',
      'El sol sale temprano.',
      'La maestra lee un cuento.',
      'Mi familia es grande.',
      'Me gusta el gallo pinto.',
      'El río corre hacia el mar.',
      'Las flores huelen bien.',
      'Los niños juegan fútbol.',
      'Mi abuela hace tortillas.',
      'La mariposa vuela alto.',
      'Tengo un perro pequeño.',
      'Hoy es un día lindo.',
      'El tucán tiene pico grande.',
      'Bebo agua fresca.',
      'Mi bicicleta es roja.',
      'Vamos al parque.',
      'La tortuga camina despacio.',
      'El bus llega temprano.',
      'Comemos arroz con frijoles.',
      'Ayudo a mi mamá.'
    ]
  },
  {
    kind: 'frases',
    grades: [3],
    items: [
      'Los monos saltan entre los árboles.',
      'En la feria compramos frutas frescas.',
      'El perezoso duerme en la rama.',
      'Mi hermana canta en el coro de la escuela.',
      'Después de clases hacemos la tarea.',
      'Los pájaros cantan al amanecer.',
      'Mi papá cocina los domingos.',
      'Las tortugas ponen huevos en la playa.',
      'El mar está tranquilo hoy.',
      'Mi abuelo cuenta historias de antes.',
      'Ayer fuimos a la playa con mi familia.',
      'La maestra nos enseñó una canción nueva.',
      'Las abejas hacen miel en la colmena.',
      'Hoy llovió muchísimo en mi pueblo.',
      'En mi barrio hay una pulpería grande.',
      'Mi gato negro duerme sobre el sillón.',
      'Mi tío recoge café en la finca.',
      'La lluvia moja las hojas verdes.'
    ]
  },
  {
    kind: 'frases',
    grades: [4],
    items: [
      'Mi escuela está cerca de la iglesia del pueblo.',
      'Los domingos visitamos a mis abuelos en Cartago.',
      'El quetzal vive en los bosques nubosos de Costa Rica.',
      'Cuando llueve, las ranas cantan toda la noche.',
      'Mi mamá prepara gallo pinto con huevo y plátano maduro.',
      'Durante las vacaciones leí tres libros de aventuras.',
      'Las tortugas marinas regresan cada año a la misma playa.',
      'En la feria del agricultor venden frutas y verduras frescas.',
      'La carreta típica es un símbolo de nuestro país.',
      'Si estudiamos juntos, aprendemos más rápido.',
      'En invierno llueve casi todas las tardes.',
      'Mi hermano mayor juega fútbol en la liga del barrio.',
      'Los colibríes se alimentan del néctar de las flores.',
      'Después de la tormenta salió un arcoíris enorme.',
      'Nuestra maestra nos pidió una exposición sobre los volcanes.',
      'El perezoso se mueve despacio para ahorrar energía.',
      'Antes de comer debemos lavarnos las manos.'
    ]
  },
  {
    kind: 'frases',
    grades: [5],
    items: [
      'Aunque llovía fuerte, el equipo siguió jugando hasta el final.',
      'El volcán Poás tiene un cráter enorme y una laguna de aguas ácidas.',
      'En Costa Rica no hay ejército desde 1948.',
      'Para cuidar el planeta debemos reciclar y ahorrar agua.',
      'Mientras mi mamá cocinaba, yo ponía la mesa.',
      'Los guardaparques protegen los animales y los bosques de nuestros parques nacionales.',
      'Cuando llegamos a la finca, el sol ya se escondía detrás de la montaña.',
      'La lectura diaria nos ayuda a escribir mejor y a conocer mundos nuevos.',
      'Mis compañeros prepararon un mural sobre la fauna de Costa Rica.',
      'Si caminas por el bosque, escucharás el canto de muchas aves.',
      'Las mariposas pasan por varias etapas antes de convertirse en adultas.',
      'La Navidad en mi barrio se celebra con tamales, música y luces.',
      'Por la mañana, los gallos despiertan a todo el vecindario.',
      'La biblioteca de la escuela recibió libros nuevos de cuentos y poemas.'
    ]
  },
  {
    kind: 'frases',
    grades: [6],
    items: [
      'Gracias al esfuerzo de todos, la escuela ganó el concurso de reciclaje.',
      'Los ríos de Costa Rica nacen en las montañas y desembocan en el mar.',
      'Aunque el camino era largo, los estudiantes llegaron a tiempo a la excursión.',
      'La biodiversidad de nuestro país es una riqueza que debemos conservar.',
      'Si cuidamos el agua hoy, las próximas generaciones podrán disfrutarla.',
      'Costa Rica tiene costas en el océano Pacífico y en el mar Caribe.',
      'Cuando terminó la presentación, el público aplaudió con entusiasmo.',
      'Para participar en el debate, debemos escuchar con respeto las ideas de los demás.',
      'La carreta es un símbolo del trabajo de los campesinos costarricenses.',
      'Es importante leer con atención antes de responder las preguntas del examen.',
      'Mis abuelos recuerdan cuando los vecinos se reunían en la plaza después de la misa.',
      'Los científicos estudian los volcanes para proteger a las comunidades cercanas.',
      'La solidaridad se demuestra cuando ayudamos a quien más lo necesita.'
    ]
  }
]

/** Las listas que sirven para un tipo y un grado, juntas */
export function itemsFor(kind: KindId, grade: Grade): string[] {
  return SETS.filter((s) => s.kind === kind && s.grades.includes(grade)).flatMap((s) => s.items)
}

export const kindAvailable = (kind: KindId, grade: Grade): boolean =>
  itemsFor(kind, grade).length > 0
