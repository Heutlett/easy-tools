import type { Level } from '../_adivinar/bands'

/** Una ficha de «¿Quién soy?»: cinco pistas de la más difícil a la más fácil */
export interface Clue5 {
  emoji: string
  answer: string
  /** Otras respuestas que también valen */
  variants: string[]
  level: Level
  clues: [string, string, string, string, string]
  fact: string
}

export interface QuienDeck {
  id: string
  title: string
  icon: string
  cards: Clue5[]
}

type Row = [
  emoji: string,
  answer: string,
  level: Level,
  clues: [string, string, string, string, string],
  fact: string,
  variants?: string[]
]

const deck = (id: string, title: string, icon: string, rows: Row[]): QuienDeck => ({
  id,
  title,
  icon,
  cards: rows.map(([emoji, answer, level, clues, fact, variants]) => ({
    emoji,
    answer,
    level,
    clues,
    fact,
    variants: variants ?? []
  }))
})

export const QUIEN_DECKS: QuienDeck[] = [
  deck('animales', 'Animales de Costa Rica', '🦥', [
    [
      '🦥',
      'Perezoso',
      1,
      [
        'Vivo en los árboles de los bosques tropicales.',
        'Bajo al suelo muy pocas veces.',
        'Tengo garras largas y curvas para agarrarme de las ramas.',
        'Me muevo muy despacio y duermo muchísimo.',
        'Soy lentísimo y siempre parezco sonreír.'
      ],
      'En su pelaje crecen algas que lo vuelven verdoso y lo ayudan a camuflarse entre las hojas.',
      ['Perezoso de tres dedos', 'Perezoso de dos dedos']
    ],
    [
      '🐆',
      'Jaguar',
      2,
      [
        'Soy el felino más grande de América.',
        'Vivo en selvas como la del Parque Nacional Corcovado.',
        'Me gusta el agua y nado muy bien.',
        'Mi pelaje es dorado con manchas en forma de rosetas.',
        'Soy un gran felino manchado y casi nunca me dejo ver.'
      ],
      'Su mordida es tan fuerte que puede atravesar el caparazón de una tortuga.',
      ['Tigre']
    ],
    [
      '🐒',
      'Mono aullador',
      2,
      [
        'Me alimento de hojas, flores y frutas.',
        'Mi cola es larga y me sirve para agarrarme de las ramas.',
        'Vivo en grupos y paso casi todo el día en las copas de los árboles.',
        'Mi grito se oye a kilómetros, sobre todo al amanecer.',
        'Soy un mono que ruge como si fuera un león.'
      ],
      'Un hueso especial en la garganta amplifica su voz y hace que se escuche a varios kilómetros.',
      ['Mono congo', 'Congo']
    ],
    [
      '🐸',
      'Rana de ojos rojos',
      2,
      [
        'De día duermo pegada a una hoja, con las patas bien dobladas.',
        'Vivo cerca de charcas y lagunas, en el bosque lluvioso.',
        'Mi cuerpo es verde y mis costados son azules con rayas.',
        'Mis dedos tienen ventosas para pegarme a las hojas.',
        'Soy una rana verde con ojos rojos muy grandes.'
      ],
      'Si la molestan, abre los ojos de golpe para sorprender y asustar a quien la ataca.',
      ['Rana arborícola de ojos rojos', 'Rana de ojos rojos']
    ],
    [
      '🐸',
      'Rana flecha roja y azul',
      3,
      [
        'Soy muy pequeña, cabría en la palma de tu mano.',
        'Vivo en los bosques húmedos del Caribe.',
        'Mi piel tiene veneno y no se me debe tocar.',
        'Mi cuerpo es rojo y mis patas son azules.',
        'Me llaman rana venenosa o rana de dardo.'
      ],
      'Sus colores tan vivos avisan a los depredadores que es venenosa.',
      ['Rana de dardo', 'Rana venenosa', 'Rana fresa', 'Rana roja y azul', 'Rana flecha']
    ],
    [
      '🦝',
      'Pizote',
      2,
      [
        'Ando en grupos grandes en busca de insectos y frutas.',
        'Tengo un hocico largo y flexible para olfatear.',
        'Mi cola es larga, con anillos, y la llevo levantada al caminar.',
        'Puedo bajar de los árboles de cabeza.',
        'Soy un mamífero de nariz larga, pariente del mapache.'
      ],
      'Las hembras andan en grupos con sus crías; los machos adultos suelen andar solos.',
      ['Coatí']
    ],
    [
      '🐻',
      'Oso hormiguero',
      2,
      [
        'No tengo dientes.',
        'Mi lengua es larguísima y pegajosa.',
        'Me alimento de hormigas y termitas.',
        'Tengo la nariz muy larga y mi cola me sirve para agarrarme de las ramas.',
        'Mi nombre dice qué me gusta comer.'
      ],
      'Puede comer miles de hormigas y termitas en un solo día.',
      ['Tamandúa']
    ],
    [
      '🦋',
      'Mariposa morpho azul',
      2,
      [
        'Soy una de las mariposas más grandes de la selva.',
        'De oruga me alimento de hojas y luego me encierro en una crisálida.',
        'Por debajo mis alas son café con manchas y así me escondo.',
        'Por arriba mis alas brillan con un azul metálico intenso.',
        'Soy una mariposa de un azul brillante.'
      ],
      'Su azul no es un pigmento: lo produce la forma de las escamas de sus alas al reflejar la luz.',
      ['Morpho', 'Morfo azul', 'Mariposa morpho', 'Mariposa azul']
    ],
    [
      '🐊',
      'Cocodrilo',
      1,
      [
        'Tengo la piel cubierta de escamas gruesas.',
        'Descanso con la boca abierta tomando el sol.',
        'En el río Tárcoles, en el Pacífico, se ven muchos como yo.',
        'Tengo una boca enorme con muchos dientes y una cola fuerte para nadar.',
        'Soy un reptil grande que vive en los ríos.'
      ],
      'Puede quedarse casi quieto en el agua, con solo los ojos y la nariz afuera.',
      ['Lagarto', 'Cocodrilo americano']
    ],
    [
      '🦎',
      'Iguana',
      1,
      [
        'Como hojas, flores y frutos.',
        'Si me atrapan por la cola, puedo soltarla y luego me vuelve a crecer.',
        'Tengo una cresta de púas en el lomo.',
        'Me gusta tomar el sol sobre ramas y rocas.',
        'Soy un reptil verde y grande, parecido a un pequeño dragón.'
      ],
      'Nada muy bien y puede aguantar la respiración bajo el agua por mucho rato.',
      ['Iguana verde']
    ],
    [
      '🦇',
      'Murciélago',
      2,
      [
        'De día duermo colgado cabeza abajo.',
        'Salgo a buscar comida de noche.',
        'Me oriento con sonidos que rebotan: eso se llama ecolocación.',
        'Soy el único mamífero que puede volar de verdad.',
        'Tengo alas de piel y vuelo en la oscuridad.'
      ],
      'Muchos murciélagos ayudan a polinizar las plantas y a esparcir sus semillas.'
    ],
    [
      '🦌',
      'Venado cola blanca',
      2,
      [
        'Me alimento de pasto, hojas y frutos.',
        'Cuando huyo levanto la cola y muestro la parte de abajo, que es blanca.',
        'Solo los machos tenemos astas.',
        'Las astas se me caen y me vuelven a crecer cada año.',
        'Soy un animal elegante con astas ramificadas.'
      ],
      'Al levantar la cola avisa a los demás venados que hay peligro.',
      ['Venado', 'Ciervo']
    ],
    [
      '🐱',
      'Ocelote',
      3,
      [
        'Soy un felino mediano y salgo sobre todo de noche.',
        'Me subo a los árboles, aunque también cazo en el suelo.',
        'Mi piel tiene manchas alargadas con borde negro.',
        'Soy más pequeño que el jaguar, pero más grande que un gato de casa.',
        'En Costa Rica me llaman manigordo.'
      ],
      'Cada ocelote tiene un patrón de manchas distinto, como una huella.',
      ['Manigordo']
    ],
    [
      '🦎',
      'Basilisco',
      2,
      [
        'Vivo cerca de ríos y quebradas.',
        'Cuando me asusto, huyo corriendo sobre dos patas.',
        'Los machos tenemos una cresta en la cabeza y otra en el lomo.',
        'Puedo correr sobre el agua sin hundirme, por un buen tramo.',
        'Me dicen «lagarto Jesucristo».'
      ],
      'Corre sobre el agua gracias a sus patas traseras largas y con flecos, y a su gran velocidad.',
      ['Lagarto Jesucristo', 'Basilisco verde']
    ],
    [
      '🐜',
      'Zompopa',
      3,
      [
        'Vivo en colonias de millones de hermanas.',
        'Camino en largas filas por el suelo del bosque.',
        'Cargo pedazos de hojas más grandes que yo.',
        'Con esas hojas cultivo un hongo dentro de mi nido.',
        'Soy una hormiga cortadora de hojas.'
      ],
      'No comen la hoja: la usan para cultivar un hongo del que sí se alimentan.',
      ['Hormiga arriera', 'Arriera', 'Hormiga cortadora de hojas']
    ],
    [
      '🐹',
      'Tepezcuintle',
      3,
      [
        'Salgo de noche a buscar frutas y semillas.',
        'Vivo en madrigueras cerca de los ríos.',
        'Soy un roedor grande, mucho más que una rata.',
        'Mi pelaje es café, con hileras de manchas blancas.',
        'También me llaman paca.'
      ],
      'Es un roedor grande y excelente nadador que se esconde en el agua cuando lo persiguen.',
      ['Paca']
    ]
  ]),

  deck('aves', 'Aves de Costa Rica', '🦜', [
    [
      '🐦',
      'Quetzal',
      3,
      [
        'Los antiguos pueblos de Mesoamérica me consideraban sagrado.',
        'Vivo en bosques nubosos de montaña, como Monteverde.',
        'Me alimento de aguacatillos, unos frutos parecidos a pequeños aguacates.',
        'El macho tiene una cola larguísima de plumas verdes brillantes.',
        'Soy un ave de pecho rojo y espalda verde brillante.'
      ],
      'Las plumas de la cola del macho pueden ser más largas que todo su cuerpo.',
      ['Quetzal resplandeciente']
    ],
    [
      '🐦',
      'Tucán',
      1,
      [
        'Me alimento sobre todo de frutas.',
        'Vivo en los árboles altos del bosque tropical.',
        'Mi pico es largo y muy liviano a pesar de su tamaño.',
        'Mi pico tiene muchos colores: verde, naranja, amarillo y rojo.',
        'Soy un ave con un pico enorme y colorido.'
      ],
      'Su pico largo le sirve para alcanzar frutas en ramas delgadas y también para regular su temperatura.',
      ['Tucán pico iris', 'Tucán de pico arcoíris']
    ],
    [
      '🦜',
      'Lapa roja',
      1,
      [
        'Hago mi nido en huecos de los árboles grandes.',
        'Me gusta volar en pareja y hacer mucho ruido.',
        'Como semillas y frutos con mi pico fuerte y curvo.',
        'Tengo plumas rojas, amarillas y azules.',
        'Soy un loro grande y colorido que grita fuerte.'
      ],
      'Las lapas rojas forman parejas para toda la vida.',
      ['Guacamaya roja', 'Lapa', 'Guacamaya']
    ],
    [
      '🦜',
      'Lapa verde',
      3,
      [
        'Dependo de un árbol llamado almendro de montaña para anidar y comer.',
        'Vivo en el norte del Caribe de Costa Rica.',
        'Estoy en peligro de extinción.',
        'Soy verde, con la frente roja y las alas azules.',
        'Soy un loro grande y verde, prima de la lapa roja.'
      ],
      'Cuidar el almendro de montaña es cuidar a la lapa verde, porque sin ese árbol no puede vivir.',
      ['Guacamaya verde']
    ],
    [
      '🐦',
      'Colibrí',
      2,
      [
        'Mi corazón late rapidísimo.',
        'Puedo volar hacia atrás.',
        'Me alimento del néctar de las flores.',
        'Mis alas se mueven tan rápido que hacen un zumbido.',
        'Soy un pajarito diminuto que se queda quieto en el aire.'
      ],
      'Puede volar hacia atrás y quedarse quieto en el aire, algo que casi ninguna otra ave logra.',
      ['Picaflor', 'Chupaflor']
    ],
    [
      '🦅',
      'Zopilote',
      2,
      [
        'Me alimento de animales muertos.',
        'Vuelo en círculos aprovechando el aire caliente que sube.',
        'Ayudo a mantener limpio el ambiente.',
        'Tengo la cabeza sin plumas.',
        'Soy un ave negra y grande que se ve volando sobre los potreros.'
      ],
      'Planea con las alas abiertas aprovechando el aire caliente, casi sin gastar energía.',
      ['Zopilote negro', 'Gallinazo']
    ],
    [
      '🐦',
      'Pelícano',
      1,
      [
        'Vivo en la costa y duermo en rocas o árboles cerca del mar.',
        'Tengo patas con membranas entre los dedos.',
        'Me lanzo en picada desde el aire para pescar.',
        'Mi pico tiene una bolsa grande.',
        'Soy un ave marina de pico enorme.'
      ],
      'Se lanza al agua desde el aire para atrapar peces con la bolsa de su pico.',
      ['Pelícano pardo']
    ],
    [
      '🐦',
      'Garza',
      2,
      [
        'Camino despacio en aguas poco profundas.',
        'Atrapo peces y ranas con mi pico afilado.',
        'Tengo las patas y el cuello largos.',
        'Mis plumas son blancas.',
        'Soy un ave blanca de patas largas que vive cerca de los ríos.'
      ],
      'Se queda inmóvil mucho rato esperando un pez y lo atrapa con un movimiento rapidísimo.',
      ['Garza blanca', 'Garceta']
    ],
    [
      '🐦',
      'Jabirú',
      3,
      [
        'Camino por humedales buscando peces y ranas.',
        'Se me puede ver en lugares como Caño Negro, en el norte.',
        'Mi cabeza y mi cuello no tienen plumas y tengo una banda roja en el cuello.',
        'Soy una de las aves voladoras más grandes de América.',
        'Soy una cigüeña gigante y blanca.'
      ],
      'Sus alas abiertas pueden medir más de dos metros.',
      ['Cigüeña jabirú']
    ],
    [
      '🐦',
      'Oropéndola',
      3,
      [
        'Mi canto parece un burbujeo.',
        'Vivo en grupos grandes en un mismo árbol.',
        'Mis nidos cuelgan como bolsas largas de las ramas.',
        'Tengo la cabeza negra, una mancha rosada y la punta del pico naranja.',
        'Mi nombre recuerda a un emperador azteca: Moctezuma.'
      ],
      'Construyen nidos colgantes, con forma de bolsa tejida, muchos juntos en un mismo árbol.',
      ['Oropéndola de Moctezuma', 'Oropéndola de Montezuma', 'Conoto']
    ],
    [
      '🐦',
      'Martín pescador',
      2,
      [
        'Me posto quieto en una rama junto al agua.',
        'Tengo la cabeza grande y las patas muy cortas.',
        'Mi pico es largo y recto.',
        'Me lanzo al agua para atrapar peces.',
        'Mi nombre dice cuál es mi oficio: pescar.'
      ],
      'Se zambulle desde una rama, pesca un pez y regresa a comérselo.',
      ['Martin pescador']
    ],
    [
      '🦉',
      'Búho',
      1,
      [
        'Cazo roedores y otros animalitos.',
        'Vuelo sin hacer ruido.',
        'Puedo girar la cabeza casi hasta atrás.',
        'Veo muy bien de noche con mis ojos grandes.',
        'Hago «hu, hu» en la oscuridad.'
      ],
      'Sus plumas especiales amortiguan el sonido para sorprender a sus presas.',
      ['Lechuza', 'Mochuelo']
    ],
    [
      '🐔',
      'Gallina',
      1,
      [
        'Vivo en las fincas y los patios.',
        'Mi cría se llama pollito.',
        'Pongo huevos.',
        'Tengo plumas y una pequeña cresta roja.',
        'Cacareo cuando pongo un huevo.'
      ],
      'Una gallina empolla sus huevos durante unos 21 días hasta que nacen los pollitos.'
    ],
    [
      '🐓',
      'Gallo',
      1,
      [
        'Vivo en las fincas y los patios.',
        'Tengo una cresta roja grande y espolones en las patas.',
        'Cuido a las gallinas de mi gallinero.',
        'Mis plumas de la cola son largas y de muchos colores.',
        'Canto «quiquiriquí» al amanecer.'
      ],
      'Su canto al amanecer es una manera de decir «este es mi territorio».'
    ],
    [
      '🦆',
      'Pato',
      1,
      [
        'Vivo en lagunas, ríos y charcos.',
        'Mis plumas casi no se mojan.',
        'Tengo patas con membranas para nadar.',
        'Mi pico es plano y ancho.',
        'Hago «cuac, cuac».'
      ],
      'Sus plumas tienen una grasa especial que hace que el agua resbale.'
    ]
  ]),

  deck('mar', 'Vida del mar', '🌊', [
    [
      '🐢',
      'Tortuga baula',
      3,
      [
        'Llego a las playas de noche a poner mis huevos.',
        'Soy la tortuga marina más grande del mundo.',
        'No tengo caparazón duro: mi espalda es como cuero con siete crestas.',
        'En Costa Rica anido en Guanacaste y en el Caribe.',
        'Soy una tortuga gigante del mar.'
      ],
      'Puede bucear a más de mil metros de profundidad en busca de medusas.',
      ['Baula', 'Tortuga laúd']
    ],
    [
      '🐢',
      'Tortuga verde',
      2,
      [
        'De adulta me alimento de pastos marinos y algas.',
        'Viajo miles de kilómetros y regreso a la playa donde nací.',
        'Las hembras ponen huevos en la arena, de noche.',
        'Cada año miles de mis parientes llegan a Tortuguero.',
        'Soy una tortuga marina con caparazón duro y aletas.'
      ],
      'Las tortugas regresan a desovar a la misma zona donde nacieron.',
      ['Tortuga marina']
    ],
    [
      '🐬',
      'Delfín',
      1,
      [
        'Me comunico con chasquidos y silbidos.',
        'Vivo en grupos llamados manadas.',
        'No soy un pez: soy mamífero y respiro aire.',
        'Salto fuera del agua y juego junto a los barcos.',
        'Soy un animal inteligente y simpático del mar.'
      ],
      'Duerme con la mitad del cerebro a la vez para poder seguir subiendo a respirar.'
    ],
    [
      '🐋',
      'Ballena jorobada',
      2,
      [
        'Viajo miles de kilómetros cada año.',
        'Vengo a aguas cálidas costarricenses a tener a mis crías.',
        'Los machos cantamos canciones largas.',
        'Salto fuera del agua y golpeo la superficie con la cola.',
        'Soy un mamífero gigante del mar.'
      ],
      'En Costa Rica se pueden ver ballenas jorobadas casi todo el año, porque llegan del norte y del sur.',
      ['Ballena']
    ],
    [
      '🦈',
      'Tiburón ballena',
      3,
      [
        'Me alimento de plancton, organismos diminutos.',
        'Mi piel tiene manchas blancas, como puntos.',
        'Aunque soy enorme, no ataco a las personas.',
        'Soy el pez más grande del mundo.',
        'Soy un tiburón gigante y tranquilo.'
      ],
      'Es el pez más grande del mar y se alimenta de seres diminutos.'
    ],
    [
      '🦈',
      'Tiburón martillo',
      3,
      [
        'Nado en grupos grandes en lugares como la Isla del Coco.',
        'Tengo los ojos en los extremos de la cabeza.',
        'Mi cabeza es ancha y plana.',
        'Mi cabeza tiene forma de martillo.',
        'Soy un tiburón con la cabeza como un martillo.'
      ],
      'Los ojos separados le dan una visión muy amplia para encontrar su alimento.'
    ],
    [
      '🐟',
      'Pez vela',
      2,
      [
        'Soy uno de los peces más veloces del mar.',
        'Me pescan en el Pacífico, por deporte.',
        'Tengo una nariz larga y puntiaguda, como una espada.',
        'Mi aleta de la espalda se abre como una vela.',
        'Mi nombre dice cómo es mi aleta: una vela.'
      ],
      'Levanta su gran aleta como una vela para acorralar a los peces pequeños.'
    ],
    [
      '🐙',
      'Pulpo',
      2,
      [
        'Tengo tres corazones.',
        'Mi sangre es azul.',
        'Puedo cambiar de color para esconderme.',
        'Suelto tinta para escapar.',
        'Tengo ocho brazos con ventosas.'
      ],
      'Puede pasar por huecos muy estrechos porque no tiene huesos.'
    ],
    [
      '⭐',
      'Estrella de mar',
      1,
      [
        'No tengo cerebro.',
        'Camino con muchos piecitos pequeños.',
        'Si pierdo un brazo, me puede volver a crecer.',
        'Vivo en el fondo del mar, pegada a las rocas.',
        'Tengo forma de estrella.'
      ],
      'Puede volver a hacer crecer un brazo perdido.'
    ],
    [
      '🐡',
      'Pez globo',
      2,
      [
        'Tengo la piel cubierta de espinas.',
        'Nado despacio y tengo aletas pequeñas.',
        'Si me asusto, me lleno de agua.',
        'Me inflo hasta quedar como una pelota.',
        'Mi nombre dice cómo me pongo: como un globo.'
      ],
      'Se infla para parecer más grande y que no se lo coman.'
    ],
    [
      '🦀',
      'Cangrejo',
      1,
      [
        'Vivo en playas, rocas y manglares.',
        'Tengo diez patas.',
        'Tengo un caparazón duro.',
        'Camino de lado.',
        'Tengo dos pinzas grandes.'
      ],
      'Camina de lado porque sus patas se doblan hacia los costados.'
    ],
    [
      '🐚',
      'Cangrejo ermitaño',
      2,
      [
        'Mi abdomen es blando y delicado.',
        'Vivo en las playas y en los charcos de las rocas.',
        'Cuando crezco, busco una casa más grande.',
        'Cargo mi casa a cuestas.',
        'Me escondo dentro de una concha vacía.'
      ],
      'Cuando se le queda chica la concha, cambia a otra más grande.'
    ],
    [
      '🦞',
      'Langosta',
      2,
      [
        'Vivo en el fondo rocoso del mar.',
        'Salgo de noche a buscar comida.',
        'Tengo antenas muy largas.',
        'Tengo un caparazón duro y una cola ancha.',
        'Me pongo roja cuando me cocinan.'
      ],
      'Se pone roja al cocinarla porque el calor cambia los pigmentos de su caparazón.'
    ],
    [
      '🦐',
      'Camarón',
      1,
      [
        'Vivo en el mar y en algunos ríos.',
        'Tengo el cuerpo dividido en segmentos.',
        'Nado hacia atrás de un salto.',
        'Tengo antenas largas y muchas patitas.',
        'Me comen en ceviche o con arroz.'
      ],
      'Cuando se asusta, dobla la cola y da un salto hacia atrás.',
      ['Camarones']
    ],
    [
      '🌊',
      'Manatí',
      3,
      [
        'Soy un mamífero acuático y como plantas.',
        'Vivo en los canales de Tortuguero y en ríos del Caribe.',
        'Subo a la superficie cada pocos minutos a respirar.',
        'Soy grande, lento y de piel gris.',
        'Me llaman «vaca marina».'
      ],
      'Pasa buena parte del día comiendo plantas acuáticas.',
      ['Vaca marina']
    ]
  ]),

  deck('plantas', 'Plantas y frutas', '🥭', [
    [
      '🍍',
      'Piña',
      1,
      [
        'Mi planta es baja y tiene hojas largas con espinas en los bordes.',
        'Costa Rica me exporta a muchos países.',
        'Tengo una corona de hojas.',
        'Mi cáscara es áspera y por dentro soy amarilla, dulce y jugosa.',
        'Soy una fruta tropical con corona.'
      ],
      'Una vez cortada, la piña ya no se pone más dulce.'
    ],
    [
      '🍌',
      'Banano',
      1,
      [
        'Mi mata parece un árbol, pero es una hierba gigante.',
        'Crezco en racimos que pesan mucho.',
        'Costa Rica me exporta, sobre todo desde el Caribe.',
        'Tengo cáscara amarilla.',
        'A los monos les encanto.'
      ],
      'Lo que parece un tronco es en realidad un tallo hecho de hojas enrolladas.'
    ],
    [
      '☕',
      'Café',
      2,
      [
        'Mi fruto parece una cereza roja.',
        'Me siembran en zonas altas de montaña, como el Valle Central.',
        'Mis semillas se secan y se tuestan.',
        'Con mis granos se prepara una bebida caliente.',
        'Los adultos me toman en la mañana.'
      ],
      'Los frutos maduros se llaman «cerezas» y se recogen a mano.',
      ['Cafeto', 'Planta de café']
    ],
    [
      '🍫',
      'Cacao',
      2,
      [
        'Mis frutos crecen pegados al tronco.',
        'Dentro hay semillas cubiertas de una pulpa blanca.',
        'Los pueblos indígenas ya me usaban antes de que llegaran los españoles.',
        'Mis semillas se tuestan y se muelen.',
        'Con mis semillas se hace el chocolate.'
      ],
      'En la antigüedad, las semillas de cacao se usaron como moneda en Mesoamérica.',
      ['Cacaotero']
    ],
    [
      '🌾',
      'Caña de azúcar',
      2,
      [
        'Soy un pasto gigante.',
        'Mi tallo es duro y está lleno de jugo dulce.',
        'Me procesan en lugares llamados trapiches.',
        'De mi jugo sale la tapa de dulce.',
        'Con mi jugo se hace el azúcar.'
      ],
      'De su jugo se hacen la tapa de dulce y el azúcar.',
      ['Caña']
    ],
    [
      '🌳',
      'Ceiba',
      3,
      [
        'Mis frutos guardan fibras suaves como algodón.',
        'Mi tronco es muy grueso y a veces tiene espinas.',
        'Soy uno de los árboles más altos del bosque lluvioso.',
        'Varios pueblos antiguos de Mesoamérica me consideraban sagrada.',
        'Soy un árbol gigante de tronco ancho.'
      ],
      'Para varios pueblos de Mesoamérica era el árbol sagrado que unía la tierra con el cielo.'
    ],
    [
      '🌽',
      'Maíz',
      1,
      [
        'Soy un tipo de pasto.',
        'Mis granos crecen en una mazorca cubierta de hojas.',
        'Con mi masa se hacen tortillas y tamales.',
        'Cuando estoy tierno me llaman elote.',
        'También me convierto en palomitas.'
      ],
      'Es uno de los alimentos más antiguos de América: se cultiva desde hace miles de años.',
      ['Elote', 'Mazorca']
    ],
    [
      '🥑',
      'Aguacate',
      1,
      [
        'Crezco en un árbol grande.',
        'Tengo la cáscara verde o casi negra.',
        'Dentro de mí hay una semilla grande y redonda.',
        'Mi pulpa es cremosa y verde.',
        'Con mi pulpa se prepara el guacamole.'
      ],
      'Su pulpa tiene grasas saludables y por eso es tan cremosa.'
    ],
    [
      '🥭',
      'Mango',
      1,
      [
        'Crezco en árboles grandes y de mucha sombra.',
        'En Costa Rica algunas personas me comen verde, con sal y limón.',
        'Tengo un hueso grande y peludo.',
        'Por dentro soy amarillo o anaranjado, jugoso y dulce.',
        'Soy una fruta tropical que empieza con la letra M.'
      ],
      'Del mismo hueso del mango puede nacer un nuevo árbol.'
    ],
    [
      '🥥',
      'Coco',
      1,
      [
        'Crezco en palmeras.',
        'Estoy cubierto por una cáscara dura y peluda.',
        'Dentro tengo agua.',
        'Mi pulpa blanca se puede rallar.',
        'Muchas veces me encuentras en la playa.'
      ],
      'Puede flotar en el mar y germinar en otra playa lejana.'
    ],
    [
      '🍉',
      'Sandía',
      1,
      [
        'Crezco en el suelo, en una planta rastrera.',
        'Mi cáscara es verde, a veces con rayas.',
        'Tengo muchas semillas negras.',
        'Por dentro soy roja, dulce y jugosa.',
        'Soy una fruta grande y refrescante.'
      ],
      'Más del 90 % de la sandía es agua.'
    ],
    [
      '🌻',
      'Girasol',
      2,
      [
        'Soy una planta alta y de tallo grueso.',
        'Mis semillas se comen y también dan aceite.',
        'Cuando soy joven, mi flor sigue al Sol durante el día.',
        'Mis pétalos son amarillos.',
        'Mi nombre dice que giro hacia el Sol.'
      ],
      'Las flores jóvenes giran durante el día siguiendo la luz del Sol.'
    ],
    [
      '🌵',
      'Cactus',
      2,
      [
        'Guardo agua dentro de mi tallo.',
        'Vivo en lugares muy secos.',
        'Mis hojas son transformadas en espinas.',
        'Si me tocas, puedo pincharte.',
        'Soy una planta verde y con espinas.'
      ],
      'Almacena agua en el tallo para sobrevivir mucho tiempo sin lluvia.'
    ],
    [
      '🍊',
      'Naranja',
      1,
      [
        'Crezco en un árbol que huele muy rico cuando florece.',
        'Soy un cítrico.',
        'Tengo gajos por dentro.',
        'Mi jugo se toma en el desayuno.',
        'Mi color y mi nombre son iguales.'
      ],
      'Es una buena fuente de vitamina C.'
    ],
    [
      '🍋',
      'Limón',
      1,
      [
        'Crezco en un árbol pequeño.',
        'Soy un cítrico.',
        'Soy muy ácido.',
        'Con mi jugo se prepara una limonada.',
        'Soy amarillo o verde y de sabor agrio.'
      ],
      'Su jugo se usa para sazonar comidas, como el ceviche.',
      ['Limón ácido']
    ]
  ]),

  deck('lugares', 'Lugares de Costa Rica', '📍', [
    [
      '🐢',
      'Tortuguero',
      1,
      [
        'Para llegar hay que ir en lancha o en avioneta, no hay carretera.',
        'Estoy en la provincia de Limón.',
        'Mis canales parecen ríos en medio de la selva.',
        'De julio a octubre llegan las tortugas verdes a poner huevos.',
        'Mi nombre viene de las tortugas.'
      ],
      'No hay carretera hasta el pueblo: se llega en lancha o en avioneta.',
      ['Parque Nacional Tortuguero']
    ],
    [
      '🌫️',
      'Monteverde',
      2,
      [
        'Estoy en la cordillera de Tilarán.',
        'Tengo un bosque nuboso.',
        'Casi siempre hay niebla.',
        'Hay puentes colgantes y tirolesas.',
        'Aquí vive el quetzal.'
      ],
      'Su bosque nuboso está casi siempre envuelto en nubes y neblina.',
      ['Reserva de Monteverde', 'Bosque nuboso de Monteverde']
    ],
    [
      '🏝️',
      'Isla del Coco',
      3,
      [
        'Estoy en el océano Pacífico, muy lejos de la costa.',
        'Soy Patrimonio Mundial de la UNESCO.',
        'Los buzos vienen a ver tiburones martillo.',
        'Cuenta la leyenda que piratas escondieron aquí tesoros.',
        'Pertenezco a Costa Rica, pero no estoy en el continente.'
      ],
      'Se dice que ahí hay tesoros de piratas escondidos, pero nunca se ha encontrado ninguno.',
      ['Parque Nacional Isla del Coco']
    ],
    [
      '🏖️',
      'Manuel Antonio',
      1,
      [
        'Estoy en el Pacífico central, cerca de Quepos.',
        'Tengo uno de los parques nacionales más visitados del país.',
        'Aquí viven perezosos y monos.',
        'La selva llega hasta la arena de la playa.',
        'Mi nombre parece de una persona.'
      ],
      'Es un parque pequeño, pero tiene playas hermosas y mucha vida silvestre.',
      ['Parque Nacional Manuel Antonio']
    ],
    [
      '🌴',
      'Corcovado',
      3,
      [
        'Estoy en la península de Osa, en el Pacífico sur.',
        'Soy una selva lluviosa muy grande y poco visitada.',
        'Aquí viven jaguares, lapas rojas y dantas.',
        'Soy un parque nacional famoso por su biodiversidad.',
        'Soy uno de los parques nacionales más famosos del Pacífico sur.'
      ],
      'Se creó en 1975 y protege una gran parte de la península de Osa.',
      ['Parque Nacional Corcovado']
    ],
    [
      '🎭',
      'Teatro Nacional',
      2,
      [
        'Me inauguraron en 1897.',
        'Me construyeron en gran parte con dinero de impuestos del café.',
        'Estoy en el centro de San José.',
        'Aquí se presentan obras, conciertos y ópera.',
        'Soy un edificio muy elegante con estatuas y un escenario.'
      ],
      'Se construyó con ayuda de los cafetaleros, que querían un teatro digno de la capital.'
    ],
    [
      '⛪',
      'Basílica de los Ángeles',
      2,
      [
        'Estoy en la provincia de Cartago.',
        'Cada 2 de agosto llegan miles de personas caminando hasta mí.',
        'Guardo una pequeña imagen de piedra oscura.',
        'Allí está la Virgen de los Ángeles, «La Negrita».',
        'Soy una iglesia muy visitada.'
      ],
      'La tradición dice que la imagen de La Negrita apareció en 1635.',
      ['Basílica', 'La Negrita']
    ],
    [
      '🐴',
      'Guanacaste',
      2,
      [
        'Me anexé a Costa Rica el 25 de julio de 1824.',
        'Aquí viven los sabaneros.',
        'Mi clima es cálido y tengo una época seca larga.',
        'Tengo playas como Tamarindo y Papagayo.',
        'Mi baile típico se llama punto guanacasteco.'
      ],
      'Se unió a Costa Rica el 25 de julio de 1824 y por eso ese día es feriado.',
      ['Provincia de Guanacaste']
    ],
    [
      '🚢',
      'Limón',
      1,
      [
        'Tengo el puerto principal del Caribe del país.',
        'Aquí se celebra un carnaval en octubre.',
        'Mi música incluye el calypso.',
        'Mi cultura tiene mucha herencia afrocaribeña.',
        'Soy la provincia del Caribe de Costa Rica.'
      ],
      'Su carnaval de octubre mezcla desfiles, música y comidas del Caribe.',
      ['Puerto Limón', 'Provincia de Limón']
    ],
    [
      '⚓',
      'Puntarenas',
      2,
      [
        'Mi ciudad está sobre una lengua de tierra larga y angosta.',
        'Tengo un puerto en el Pacífico.',
        'De aquí salen ferris hacia la península de Nicoya.',
        'Tengo un paseo de los turistas junto al mar.',
        'Mi nombre dice que soy una «punta de arenas».'
      ],
      'Su ciudad principal se extiende sobre una lengua de arena que se mete en el mar.',
      ['Provincia de Puntarenas']
    ],
    [
      '🐠',
      'Cahuita',
      3,
      [
        'Estoy en el Caribe sur.',
        'Tengo un arrecife de coral.',
        'Mis senderos pasan cerca de la playa.',
        'Aquí se oyen los monos congo.',
        'Soy un parque nacional del Caribe.'
      ],
      'Su arrecife es uno de los más importantes del Caribe costarricense.',
      ['Parque Nacional Cahuita']
    ],
    [
      '🏟️',
      'Parque La Sabana',
      2,
      [
        'Aquí estuvo el primer aeropuerto internacional del país.',
        'Estoy en San José.',
        'Tengo un lago y un museo de arte.',
        'Aquí está el Estadio Nacional.',
        'Muchas personas vienen a correr y a hacer ejercicio.'
      ],
      'Antes de que existiera el aeropuerto Juan Santamaría, los aviones aterrizaban aquí.',
      ['La Sabana', 'Parque Metropolitano La Sabana']
    ],
    [
      '🐋',
      'Marino Ballena',
      3,
      [
        'Estoy en el Pacífico sur, cerca de Uvita.',
        'Soy un parque nacional marino.',
        'Cuando baja la marea aparece un banco de arena largo.',
        'Ese banco de arena tiene forma de cola de ballena.',
        'Mi nombre dice qué animal visita mis aguas.'
      ],
      'Cuando baja la marea, la arena forma una «cola de ballena» que se puede recorrer a pie.',
      ['Uvita', 'Bahía Ballena', 'Parque Nacional Marino Ballena']
    ],
    [
      '🦆',
      'Caño Negro',
      3,
      [
        'Estoy al norte, cerca de Los Chiles.',
        'Soy un refugio de vida silvestre.',
        'En época de lluvias mi laguna crece mucho.',
        'Hay muchas aves migratorias, como patos y garzas.',
        'Aquí vive el jabirú.'
      ],
      'Es un humedal donde llegan muchísimas aves de lugares lejanos.',
      ['Refugio Caño Negro']
    ],
    [
      '🏛️',
      'Cartago',
      2,
      [
        'Fui la capital de Costa Rica hasta 1823.',
        'Mis ruinas de una iglesia sin techo son famosas.',
        'Cerca de mí está el volcán Irazú.',
        'En mi provincia está la Basílica de los Ángeles.',
        'Soy una de las siete provincias, vecina de San José.'
      ],
      'Fue la capital del país durante la época colonial, hasta 1823.',
      ['Provincia de Cartago']
    ],
    [
      '🐊',
      'Río Tárcoles',
      2,
      [
        'Desemboco en el Pacífico.',
        'Paso cerca de la carretera hacia la costa.',
        'Un puente sobre mí es famoso por lo que se ve abajo.',
        'Se puede mirar desde arriba a muchos cocodrilos.',
        'Mi nombre empieza con «Tár».'
      ],
      'Desde el puente se pueden ver cocodrilos enormes tomando el sol.',
      ['Tárcoles', 'Puente de los cocodrilos']
    ]
  ]),

  deck('volcanes', 'Volcanes, montañas y ríos', '🌋', [
    [
      '🌋',
      'Volcán Arenal',
      1,
      [
        'Estoy en la zona de La Fortuna.',
        'A mi lado hay un lago grande del mismo nombre.',
        'Tengo la forma de un cono casi perfecto.',
        'Mi última etapa de erupciones fue de 1968 a 2010.',
        'Durante muchos años lancé lava y humo.'
      ],
      'Entre 1968 y 2010 tuvo erupciones casi todos los días.',
      ['Arenal']
    ],
    [
      '🌋',
      'Volcán Poás',
      1,
      [
        'Estoy en la provincia de Alajuela.',
        'Cerca de mí se cultivan fresas.',
        'Mi cráter principal es enorme.',
        'Mi laguna es de agua muy ácida y color turquesa.',
        'A veces salen gases de mi cráter.'
      ],
      'Su cráter principal es de los más grandes del mundo y tiene una laguna muy ácida.',
      ['Poás']
    ],
    [
      '🌋',
      'Volcán Irazú',
      2,
      [
        'En 1963 hice erupción cuando visitó el país el presidente Kennedy.',
        'Estoy cerca de Cartago.',
        'Soy el volcán activo más alto de Costa Rica.',
        'Desde mi cima, en días despejados, dicen que se ven dos océanos.',
        'Mi cráter principal tiene una laguna verde.'
      ],
      'Dicen que en días muy despejados, desde su cima se pueden ver el Pacífico y el Caribe.',
      ['Irazú']
    ],
    [
      '🌋',
      'Volcán Turrialba',
      3,
      [
        'Estoy cerca del cantón de Turrialba.',
        'Estoy entre Cartago y Limón.',
        'Desde 2010 he lanzado ceniza varias veces.',
        'A veces la ceniza ha llegado hasta San José.',
        'Soy vecino del volcán Irazú.'
      ],
      'Su ceniza ha llegado a San José y obligó a cerrar el aeropuerto en algunas ocasiones.',
      ['Turrialba']
    ],
    [
      '🌋',
      'Volcán Rincón de la Vieja',
      3,
      [
        'Estoy en Guanacaste.',
        'En mis faldas hay un parque nacional.',
        'Tengo aguas termales y pailas de barro.',
        'De mi cráter salen fumarolas.',
        'Mi nombre recuerda a una señora de edad.'
      ],
      'En sus faldas hay pailas de barro que burbujean y aguas termales.',
      ['Rincón de la Vieja']
    ],
    [
      '⛰️',
      'Cerro Chirripó',
      2,
      [
        'Estoy en la cordillera de Talamanca.',
        'No soy un volcán.',
        'Hay que caminar varias horas para llegar a mi cima.',
        'Dicen que desde mi cima se ven el Pacífico y el Caribe.',
        'Soy la montaña más alta de Costa Rica.'
      ],
      'Mide más de 3 800 metros: es la montaña más alta del país.',
      ['Chirripó']
    ],
    [
      '🌋',
      'Volcán Barva',
      3,
      [
        'Estoy cerca de la provincia de Heredia.',
        'Mi zona es de bosque nuboso.',
        'Tengo pequeñas lagunas cerca de la cima.',
        'Formo parte del Parque Nacional Braulio Carrillo.',
        'Mi nombre empieza con «B».'
      ],
      'Cerca de su cima hay lagunas en antiguos cráteres.',
      ['Barva']
    ],
    [
      '🌋',
      'Volcán Miravalles',
      3,
      [
        'Estoy en Guanacaste.',
        'Mi calor interno se aprovecha para generar electricidad.',
        'Aquí hay pozos de vapor.',
        'Se dice que soy una fuente de energía geotérmica.',
        'Mi nombre dice que se ven «valles».'
      ],
      'El calor de la tierra en esta zona se usa para producir electricidad.',
      ['Miravalles']
    ],
    [
      '🌋',
      'Volcán Tenorio',
      3,
      [
        'Estoy en el norte del país.',
        'En mi parque nacional hay un río de color celeste.',
        'Es el Río Celeste.',
        'Cerca hay una catarata muy visitada.',
        'Mi nombre empieza con «Te».'
      ],
      'El Río Celeste se ve azul turquesa porque unas partículas minerales diminutas dispersan la luz.',
      ['Tenorio']
    ],
    [
      '⛰️',
      'Cerro de la Muerte',
      3,
      [
        'Estoy en la cordillera de Talamanca.',
        'Mi zona es muy fría y con mucha niebla.',
        'Paso de los 3 000 metros de altura.',
        'Por mí pasa la carretera Interamericana.',
        'Mi nombre suena un poco misterioso.'
      ],
      'Se dice que su nombre viene de que, en el pasado, el frío extremo ponía en peligro a quienes lo cruzaban a pie.'
    ],
    [
      '🏔️',
      'Cordillera de Talamanca',
      3,
      [
        'Comparto territorio con Panamá.',
        'En mí está el parque internacional La Amistad.',
        'Soy la cordillera más alta del país.',
        'En mí está el cerro Chirripó.',
        'Soy un conjunto de montañas en el sur del país.'
      ],
      'Es la cordillera más alta de Costa Rica y se extiende hasta Panamá.',
      ['Talamanca']
    ],
    [
      '💧',
      'Lago Arenal',
      3,
      [
        'Mi tamaño actual se debe a una represa para producir electricidad.',
        'Soy el lago más grande de Costa Rica.',
        'Aquí hay mucho viento y se practica windsurf.',
        'Soy vecino de un volcán.',
        'Comparto mi nombre con un famoso volcán.'
      ],
      'Es el lago más grande del país; su tamaño actual se debe a una represa que produce electricidad.',
      ['Laguna de Arenal', 'Laguna Arenal']
    ],
    [
      '🚣',
      'Río Pacuare',
      3,
      [
        'Nazco en la cordillera de Talamanca.',
        'Desemboco en el Caribe.',
        'Paso por selvas y cañones.',
        'Es muy famoso para hacer rafting.',
        'Mi nombre empieza con «Pa».'
      ],
      'Es uno de los ríos más conocidos de Costa Rica para hacer rafting.',
      ['Pacuare']
    ],
    [
      '🏞️',
      'Río San Juan',
      3,
      [
        'Desemboco en el mar Caribe.',
        'Nazco en el lago de Nicaragua.',
        'Una parte de mí es frontera de Costa Rica.',
        'Separo en parte a Costa Rica de Nicaragua.',
        'Mi nombre es el de un santo.'
      ],
      'Una parte de este río forma la frontera entre Costa Rica y Nicaragua.',
      ['San Juan']
    ],
    [
      '🏞️',
      'Río Tempisque',
      3,
      [
        'Soy un río de la provincia de Guanacaste.',
        'Desemboco en el golfo de Nicoya.',
        'Cerca de mí está el Parque Nacional Palo Verde.',
        'Mis humedales son hogar de muchas aves.',
        'Mi nombre empieza con «Tem».'
      ],
      'Sus humedales son un lugar importante para aves acuáticas y otras especies.',
      ['Tempisque']
    ]
  ]),

  deck('patrios', 'Símbolos y fechas de Costa Rica', '🇨🇷', [
    [
      '🚩',
      'Bandera',
      1,
      [
        'Me crearon en 1848.',
        'Una primera dama propuso agregar una franja roja en el centro.',
        'Tengo cinco franjas.',
        'Mis colores son azul, blanco y rojo.',
        'Me izan en el acto cívico de la escuela.'
      ],
      'La franja roja del centro fue idea de doña Pacífica Fernández, primera dama en 1848.',
      ['Bandera nacional', 'Bandera de Costa Rica']
    ],
    [
      '🛡️',
      'Escudo',
      2,
      [
        'Aparecen siete estrellas en mi parte de arriba.',
        'Las estrellas representan las siete provincias.',
        'En mí se ven tres volcanes y dos mares.',
        'Tengo dos barcos, uno en cada océano.',
        'Soy el emblema del país en los documentos oficiales.'
      ],
      'Sus siete estrellas representan las siete provincias del país.',
      ['Escudo nacional', 'Escudo de Costa Rica']
    ],
    [
      '🎶',
      'Himno Nacional',
      1,
      [
        'La música se compuso en 1852.',
        'La letra actual se escribió en 1903.',
        'Empiezo diciendo «Noble patria, tu hermosa bandera».',
        'Me cantan de pie, en los actos cívicos.',
        'Soy la canción oficial del país.'
      ],
      'La música la compuso Manuel María Gutiérrez y la letra actual es de José María Zeledón.',
      ['Himno']
    ],
    [
      '🌸',
      'Guaria morada',
      3,
      [
        'Crezco sobre otros árboles sin hacerles daño.',
        'Soy una orquídea.',
        'Mis flores son moradas y muy vistosas.',
        'Soy muy común en jardines y en el Valle Central.',
        'Soy la flor nacional de Costa Rica.'
      ],
      'Es una orquídea epífita: vive sobre otros árboles sin hacerles daño.',
      ['Guaria', 'Flor nacional']
    ],
    [
      '🐦',
      'Yigüirro',
      2,
      [
        'Mi plumaje es café grisáceo.',
        'Soy muy común en jardines y parques.',
        'Se dice que mi canto anuncia la lluvia.',
        'Mi canto es melodioso.',
        'Soy el ave nacional de Costa Rica.'
      ],
      'Los campesinos dicen que su canto llama a la lluvia.',
      ['Ave nacional', 'Mirlo pardo']
    ],
    [
      '🌳',
      'Guanacaste',
      2,
      [
        'Mi fruto es una vaina enroscada que parece una oreja.',
        'Mi copa es ancha y da mucha sombra.',
        'Muchos me llaman «orejón».',
        'Soy el árbol nacional.',
        'Mi nombre es el de una provincia.'
      ],
      'Su fruto, con forma de oreja, le dio el apodo de «orejón».',
      ['Árbol de Guanacaste', 'Árbol nacional']
    ],
    [
      '🐂',
      'Carreta',
      2,
      [
        'Antes ayudaba a llevar el café hasta el puerto de Puntarenas.',
        'Me tiran bueyes.',
        'Mis ruedas son de madera y están hechas de tablas.',
        'Me pintan con diseños de muchos colores.',
        'Soy el símbolo nacional del trabajo.'
      ],
      'En 2005 la UNESCO proclamó la tradición del boyeo y la carreta como Obra Maestra del Patrimonio Oral e Inmaterial de la Humanidad.',
      ['Carreta típica', 'Carreta costarricense']
    ],
    [
      '🎹',
      'Marimba',
      2,
      [
        'Soy un instrumento muy ligado a Guanacaste.',
        'Mis teclas son de madera.',
        'Se me toca con baquetas.',
        'Me tocan varias personas a la vez.',
        'Soy el instrumento nacional.'
      ],
      'Es el instrumento nacional y se toca golpeando sus teclas de madera con baquetas.',
      ['Instrumento nacional']
    ],
    [
      '💰',
      'Colón',
      2,
      [
        'Reemplacé al peso en 1896.',
        'Mi símbolo es ₡.',
        'Mi nombre recuerda a un navegante.',
        'Hay billetes y monedas.',
        'Soy la moneda de Costa Rica.'
      ],
      'Se llama así en honor a Cristóbal Colón, que llegó a la costa del Caribe en 1502.',
      ['Colones', 'Moneda']
    ],
    [
      '🗿',
      'Monumento Nacional',
      3,
      [
        'Me inauguraron en 1895.',
        'Estoy en el Parque Nacional de San José.',
        'Recuerdo la unión de Centroamérica contra William Walker.',
        'Tengo figuras que representan a las repúblicas centroamericanas.',
        'Soy un monumento histórico de San José.'
      ],
      'Recuerda la unión de los países de Centroamérica durante la lucha contra William Walker.'
    ],
    [
      '🗺️',
      'Las siete provincias',
      2,
      [
        'Somos siete.',
        'Las siete estrellas del escudo nos representan.',
        'Una de nosotras es Guanacaste.',
        'Otra es Limón, en el Caribe.',
        'Somos San José, Alajuela, Cartago, Heredia, Guanacaste, Puntarenas y Limón.'
      ],
      'Cada estrella del escudo nacional representa una de las provincias.',
      ['Provincias', 'Las provincias']
    ],
    [
      '🔥',
      'Antorcha de la Libertad',
      2,
      [
        'Cada año recorro Centroamérica.',
        'Salgo de Guatemala y llego a Cartago.',
        'Me llevan estudiantes y deportistas corriendo.',
        'Llego cerca del 14 de setiembre.',
        'Soy una llama que simboliza la independencia.'
      ],
      'Cada año, la antorcha recorre Centroamérica llevada por relevos de corredores.',
      ['Antorcha', 'Antorcha de la independencia']
    ],
    [
      '🎆',
      'Independencia',
      2,
      [
        'Me firmaron en Guatemala en 1821.',
        'La noticia tardó casi un mes en llegar a Costa Rica.',
        'La noche anterior se pasean faroles.',
        'Se celebra cada 15 de setiembre.',
        'Hay desfiles de escuelas y bandas.'
      ],
      'La noticia de la independencia tardó casi un mes en llegar a Costa Rica.',
      ['Día de la Independencia', '15 de setiembre']
    ],
    [
      '🕊️',
      'Abolición del ejército',
      3,
      [
        'Ocurrió en 1948.',
        'Un presidente de la Junta de Gobierno lo anunció: José Figueres.',
        'Un cuartel se convirtió en museo.',
        'Desde entonces no hay soldados, sino Fuerza Pública.',
        'Costa Rica es famosa por ser un país sin ejército.'
      ],
      'El antiguo cuartel Bellavista se convirtió en el Museo Nacional.',
      ['Sin ejército', 'Abolición del ejército en 1948']
    ],
    [
      '😎',
      'Pura vida',
      1,
      [
        'Son dos palabras.',
        'La dicen los costarricenses a todas horas.',
        'Sirve para saludar y para despedirse.',
        'También se usa para decir «todo está bien» o «gracias».',
        'Es la frase más famosa de Costa Rica.'
      ],
      'Se usa para saludar, para decir que todo está bien y para dar las gracias.',
      ['Pura vida']
    ]
  ]),

  deck('historia', 'Personajes de Costa Rica', '👤', [
    [
      '🥁',
      'Juan Santamaría',
      1,
      [
        'Nací en Alajuela.',
        'Fui soldado de la Campaña Nacional de 1856.',
        'Era tambor del ejército.',
        'Incendié el mesón de Rivas, en Nicaragua, en 1856.',
        'Soy el héroe nacional de Costa Rica.'
      ],
      'Cada 11 de abril se recuerda su hazaña en la batalla de Rivas.',
      ['Erizo', 'Santamaría']
    ],
    [
      '👩‍⚕️',
      'Pancha Carrasco',
      3,
      [
        'Participé en la guerra de 1856–1857.',
        'Fui una de las pocas mujeres que se unió al ejército en esa época.',
        'Ayudé a cuidar a los soldados heridos.',
        'Defendí a Costa Rica de los filibusteros de William Walker.',
        'Soy una heroína de la Campaña Nacional y mi nombre completo es Francisca Carrasco.'
      ],
      'Fue una de las mujeres que participó en la Campaña Nacional contra los filibusteros.',
      ['Francisca Carrasco']
    ],
    [
      '📚',
      'Carmen Lyra',
      2,
      [
        'Mi nombre verdadero era María Isabel Carvajal.',
        'Fui maestra y dirigí una escuela para niños pequeños.',
        'Escribí en 1920 un libro de cuentos.',
        'En mis cuentos aparecen Tío Conejo y Tío Tigre.',
        'Mi libro más famoso es «Cuentos de mi tía Panchita».'
      ],
      '«Carmen Lyra» era un seudónimo: su nombre real era María Isabel Carvajal.',
      ['María Isabel Carvajal', 'Carvajal']
    ],
    [
      '🕊️',
      'José Figueres Ferrer',
      3,
      [
        'Nací en 1906.',
        'Presidí la Junta de Gobierno después de la guerra civil de 1948.',
        'La gente me decía «don Pepe».',
        'Anuncié la abolición del ejército.',
        'Por mi decisión el cuartel Bellavista se hizo museo.'
      ],
      'En 1948 entregó simbólicamente la llave del cuartel Bellavista al Ministerio de Educación.',
      ['Don Pepe', 'José Figueres', 'Figueres']
    ],
    [
      '🏛️',
      'Juan Rafael Mora Porras',
      3,
      [
        'Nací en 1814.',
        'Fui empresario cafetalero.',
        'Fui presidente de Costa Rica de 1849 a 1859.',
        'Llamé a los costarricenses a defender el país en 1856.',
        'Dirigí la Campaña Nacional contra William Walker.'
      ],
      'Dirigió la Campaña Nacional de 1856–1857 contra los filibusteros.',
      ['Juan Rafael Mora', 'Mora Porras']
    ],
    [
      '🐍',
      'Clodomiro Picado',
      3,
      [
        'Nací en 1887.',
        'Fui científico costarricense.',
        'Estudié el veneno de las serpientes.',
        'Preparé sueros contra las mordeduras de serpientes.',
        'Un instituto de la Universidad de Costa Rica lleva mi nombre.'
      ],
      'El instituto que lleva su nombre produce sueros contra mordeduras de serpiente.',
      ['Clodomiro Picado Twight', 'Picado']
    ],
    [
      '🚀',
      'Franklin Chang-Díaz',
      2,
      [
        'Nací en San José en 1950.',
        'Estudié ingeniería y física.',
        'Trabajé en la NASA.',
        'Fui astronauta y viajé al espacio varias veces.',
        'Soy el primer costarricense en viajar al espacio.'
      ],
      'Viajó al espacio siete veces, igualando el récord de misiones en transbordador.',
      ['Franklin Chang Díaz', 'Franklin Chang', 'Chang-Díaz']
    ],
    [
      '🏊',
      'Claudia Poll',
      2,
      [
        'Practico un deporte en el agua.',
        'Competí en los Juegos Olímpicos de Atlanta en 1996.',
        'Soy campeona olímpica en los 200 metros libres.',
        'Gané la primera medalla de oro olímpica para Costa Rica.',
        'Soy nadadora costarricense.'
      ],
      'Su medalla de oro en 1996 fue la primera medalla de oro olímpica de Costa Rica.',
      ['Poll']
    ],
    [
      '🏛️',
      'Ricardo Jiménez Oreamuno',
      3,
      [
        'Nací en 1859.',
        'Estudié derecho.',
        'Mucha gente me decía «don Ricardo».',
        'Fui presidente en 1910, en 1924 y en 1932.',
        'Fui presidente de Costa Rica en tres períodos distintos.'
      ],
      'Fue presidente de Costa Rica en tres períodos distintos.',
      ['Don Ricardo', 'Ricardo Jiménez']
    ],
    [
      '👩‍💼',
      'Laura Chinchilla',
      2,
      [
        'Estudié ciencias políticas.',
        'Fui vicepresidenta del país.',
        'Gané las elecciones de 2010.',
        'Goberné de 2010 a 2014.',
        'Fui la primera mujer presidenta de Costa Rica.'
      ],
      'Fue la primera mujer elegida presidenta de Costa Rica.',
      ['Chinchilla']
    ],
    [
      '🏅',
      'Óscar Arias',
      3,
      [
        'Fui presidente de Costa Rica en dos períodos.',
        'Propuse un plan para la paz en Centroamérica.',
        'Mi plan se firmó en 1987.',
        'Por ello recibí un premio mundial.',
        'Gané el Premio Nobel de la Paz en 1987.'
      ],
      'Recibió el Premio Nobel de la Paz en 1987 por su plan de paz para Centroamérica.',
      ['Oscar Arias', 'Arias']
    ],
    [
      '🎓',
      'Mauro Fernández',
      3,
      [
        'Fui ministro de Educación.',
        'Impulsé una reforma en la educación en 1886.',
        'Quería que la enseñanza llegara a todos.',
        'Mejoré las escuelas y los colegios del país.',
        'Me recuerdan como un gran impulsor de la educación pública.'
      ],
      'Impulsó una gran reforma de la educación pública en 1886.',
      ['Mauro Fernández Acuña']
    ],
    [
      '🏛️',
      'Juan Mora Fernández',
      3,
      [
        'Nací en 1784.',
        'Fui jefe de Estado durante nueve años.',
        'Gobernaba cuando Costa Rica era parte de la República Federal de Centroamérica.',
        'Empecé a gobernar en 1824.',
        'Fui el primer jefe de Estado de Costa Rica.'
      ],
      'Fue el primer jefe de Estado de Costa Rica, a partir de 1824.',
      ['Juan Mora']
    ],
    [
      '🧤',
      'Keylor Navas',
      1,
      [
        'Nací en Costa Rica.',
        'Jugué en la Selección de mi país.',
        'Jugué en clubes de España y Francia.',
        'Atajo balones.',
        'Soy un portero famoso y jugué en el Real Madrid.'
      ],
      'Fue portero del Real Madrid y ganó la Champions League.',
      ['Navas']
    ],
    [
      '📜',
      'José María Zeledón',
      3,
      [
        'Nací en 1877.',
        'Me decían «Billo».',
        'Fui poeta y escritor.',
        'Escribí una letra para una famosa canción.',
        'Escribí la letra actual del Himno Nacional.'
      ],
      'Escribió la letra del Himno Nacional en 1903.',
      ['Billo Zeledón', 'Billo', 'Zeledón']
    ]
  ]),

  deck('oficios', 'Oficios y profesiones', '👩‍🏫', [
    [
      '👩‍🏫',
      'Maestra',
      1,
      [
        'Trabajo con niños y niñas.',
        'Preparo clases todos los días.',
        'Califico trabajos y exámenes.',
        'Uso una pizarra.',
        'Enseño en la escuela.'
      ],
      'Una buena maestra ayuda a descubrir de qué es capaz cada estudiante.',
      ['Maestro', 'Docente', 'Profesora']
    ],
    [
      '🧑‍⚕️',
      'Médico',
      1,
      [
        'Estudié muchos años en la universidad.',
        'Uso un estetoscopio.',
        'Reviso a las personas enfermas.',
        'Mando medicinas.',
        'Trabajo en un hospital o en un EBAIS.'
      ],
      'Para llamar a una ambulancia en Costa Rica se marca el 9-1-1.',
      ['Doctor', 'Doctora', 'Médica']
    ],
    [
      '🧑‍🚒',
      'Bombero',
      1,
      [
        'Me preparo para las emergencias.',
        'Uso casco y traje especial.',
        'Rescato personas en peligro.',
        'Apago incendios con mangueras.',
        'Manejo un camión rojo con sirena.'
      ],
      'Si hay una emergencia, se llama al 9-1-1.',
      ['Bombera']
    ],
    [
      '👮',
      'Policía',
      1,
      [
        'Uso uniforme.',
        'Cuido a las personas y sus casas.',
        'Manejo una patrulla.',
        'Ayudo a cumplir las leyes.',
        'Ayudo cuando llamas al 9-1-1.'
      ],
      'En Costa Rica el número de emergencias es el 9-1-1.',
      ['Oficial de tránsito', 'Policía de tránsito']
    ],
    [
      '🧑‍🌾',
      'Agricultor',
      1,
      [
        'Madrugo mucho para trabajar.',
        'Trabajo la tierra.',
        'Siembro y cuido las plantas.',
        'Cosecho frutas, verduras y granos.',
        'Trabajo en la finca.'
      ],
      'Gracias a los agricultores llegan a nuestra mesa el arroz, los frijoles, las frutas y el café.',
      ['Agricultora', 'Campesino']
    ],
    [
      '🎣',
      'Pescador',
      1,
      [
        'Trabajo en el mar o en un río.',
        'Salgo en lancha o bote.',
        'Uso redes o anzuelos.',
        'Atrapo peces.',
        'Mi trabajo es pescar.'
      ],
      'Muchos pescadores salen de madrugada, cuando el mar está más tranquilo.',
      ['Pescadora']
    ],
    [
      '📬',
      'Cartero',
      1,
      [
        'Camino o ando en moto o bicicleta.',
        'Conozco muchas direcciones.',
        'Llevo sobres y paquetes.',
        'Llevo cartas a las casas.',
        'Trabajo en el correo.'
      ],
      'Gracias a los carteros llegan cartas y paquetes a casas de todo el país.',
      ['Cartera']
    ],
    [
      '🦷',
      'Dentista',
      1,
      [
        'Trabajo en un consultorio.',
        'Uso un espejito y una luz.',
        'Reviso la boca.',
        'Limpio y arreglo las muelas.',
        'Cuido tus dientes.'
      ],
      'Cepillarse los dientes después de comer ayuda a evitar caries.',
      ['Odontólogo', 'Odontóloga']
    ],
    [
      '🐕',
      'Veterinario',
      1,
      [
        'Estudié medicina, pero no para personas.',
        'Reviso a los animales.',
        'Les pongo vacunas.',
        'Cuido a perros, gatos y animales de la finca.',
        'Soy el doctor de las mascotas.'
      ],
      'Los veterinarios cuidan tanto a las mascotas como a los animales de las fincas.',
      ['Veterinaria']
    ],
    [
      '🔨',
      'Carpintero',
      1,
      [
        'Trabajo con madera.',
        'Uso serrucho, martillo y clavos.',
        'Hago puertas, mesas y sillas.',
        'Mi taller huele a madera.',
        'Construyo muebles.'
      ],
      'Una mesa de madera puede tardar varios días en terminarse.',
      ['Carpintera']
    ],
    [
      '🥖',
      'Panadero',
      1,
      [
        'Me levanto muy temprano.',
        'Trabajo en una panadería.',
        'Uso harina y levadura.',
        'Uso un horno caliente.',
        'Preparo el pan.'
      ],
      'El pan se mezcla con harina, agua, sal y levadura.',
      ['Panadera']
    ],
    [
      '✈️',
      'Piloto',
      2,
      [
        'Estudié para tener una licencia especial.',
        'Trabajo en una cabina con muchos botones.',
        'Hablo con la torre de control.',
        'Llevo personas de un país a otro.',
        'Manejo un avión.'
      ],
      'Para ser piloto hay que estudiar mucho y practicar muchas horas de vuelo.',
      ['Piloto de avión']
    ],
    [
      '🏞️',
      'Guardaparques',
      2,
      [
        'Trabajo al aire libre.',
        'Camino por senderos.',
        'Cuido los animales y las plantas del bosque.',
        'Atiendo a las personas que visitan.',
        'Trabajo en un parque nacional.'
      ],
      'Los guardaparques protegen áreas naturales que son hogar de miles de especies.',
      ['Guardaparque']
    ],
    [
      '🏗️',
      'Ingeniero',
      3,
      [
        'Estudié matemática y física.',
        'Hago cálculos para que las cosas funcionen.',
        'Reviso planos.',
        'Dirijo construcciones de obras grandes.',
        'Diseño puentes, carreteras y edificios.'
      ],
      'Un puente bien diseñado puede durar más de cien años.',
      ['Ingeniera', 'Ingeniero civil']
    ],
    [
      '🔬',
      'Científico',
      3,
      [
        'Hago preguntas y busco respuestas.',
        'Trabajo en un laboratorio o en el campo.',
        'Hago experimentos.',
        'Uso microscopios y otros instrumentos.',
        'Investigo cómo funciona el mundo.'
      ],
      'Muchos científicos de Costa Rica estudian la gran variedad de animales y plantas del país.',
      ['Científica', 'Investigador', 'Investigadora']
    ]
  ]),

  deck('objetos', 'Objetos del aula y del hogar', '🎒', [
    [
      '✏️',
      'Lápiz',
      1,
      [
        'Se usa en la escuela.',
        'Tiene una punta que se gasta.',
        'Se afila con un sacapuntas.',
        'Tiene una goma en la parte de atrás.',
        'Con él se escribe y se dibuja.'
      ],
      'La mina del lápiz es de grafito, no de plomo.'
    ],
    [
      '✂️',
      'Tijeras',
      1,
      [
        'Tienen dos hojas de metal.',
        'Hay que usarlas con cuidado.',
        'Tienen dos agujeros para los dedos.',
        'Se usan en manualidades.',
        'Sirven para cortar papel.'
      ],
      'Las tijeras funcionan como dos cuchillas que se cierran juntas.',
      ['Tijera']
    ],
    [
      '⏰',
      'Reloj',
      1,
      [
        'Puede ir en la pared o en la muñeca.',
        'Tiene números.',
        'Algunos tienen manecillas.',
        'Nos avisa cuándo llega el recreo.',
        'Sirve para saber la hora.'
      ],
      'Antes de los relojes de hoy, la gente usaba relojes de sol y de agua.',
      ['Reloj de pared']
    ],
    [
      '🎒',
      'Mochila',
      1,
      [
        'Tiene cierres.',
        'Se lleva en la espalda.',
        'Tiene correas.',
        'Puede ser de muchos colores.',
        'Llevo en ella mis cuadernos al cole.'
      ],
      'Llevar la mochila en los dos hombros ayuda a cuidar la espalda.'
    ],
    [
      '☂️',
      'Paraguas',
      1,
      [
        'Se abre y se cierra.',
        'Se usa en el invierno costarricense.',
        'Tiene un mango.',
        'Nos protege de la lluvia.',
        'Es como un techo portátil.'
      ],
      'En Costa Rica, de mayo a noviembre llueve mucho y se usa bastante.',
      ['Sombrilla']
    ],
    [
      '🧹',
      'Escoba',
      1,
      [
        'Es larga.',
        'Tiene un palo y cerdas.',
        'Se usa en la casa y en la escuela.',
        'Sirve para limpiar el piso.',
        'Se usa para barrer.'
      ],
      'Las escobas tradicionales se hacen con paja o con fibras de plantas.'
    ],
    [
      '🪞',
      'Espejo',
      1,
      [
        'Está hecho de vidrio.',
        'Hay uno en el baño.',
        'Puedo mirarme en él.',
        'Me muestra mi reflejo.',
        'Con él me peino.'
      ],
      'Los espejos tienen una capa de metal detrás del vidrio que refleja la luz.'
    ],
    [
      '🔦',
      'Linterna',
      2,
      [
        'Funciona con pilas.',
        'Se enciende con un botón.',
        'Se lleva en los campamentos.',
        'Sirve para ver cuando hay apagón.',
        'Da luz en la oscuridad.'
      ],
      'Se usa mucho cuando se va la luz.'
    ],
    [
      '🧮',
      'Calculadora',
      2,
      [
        'Tiene una pantalla.',
        'Tiene botones con números.',
        'Funciona con pilas o con luz.',
        'Hace cuentas rapidísimo.',
        'Sirve para sumar, restar, multiplicar y dividir.'
      ],
      'Una calculadora puede hacer en un segundo cuentas que a mano tardarían mucho.'
    ],
    [
      '🔬',
      'Microscopio',
      3,
      [
        'Tiene lentes.',
        'Se usa en los laboratorios.',
        'Hay que enfocarlo.',
        'Se pone una muestra muy pequeña sobre un vidrio.',
        'Sirve para ver cosas diminutas que no se ven a simple vista.'
      ],
      'Con un microscopio se pueden ver células, bacterias y detalles de las plantas.'
    ],
    [
      '🧭',
      'Brújula',
      3,
      [
        'Es pequeña y puede caber en un bolsillo.',
        'Tiene una aguja magnética.',
        'Se usa para orientarse.',
        'Su aguja siempre apunta al norte.',
        'Sirve para saber hacia dónde queda el norte.'
      ],
      'La aguja se orienta porque la Tierra funciona como un enorme imán.'
    ],
    [
      '🔭',
      'Telescopio',
      3,
      [
        'Tiene lentes o espejos.',
        'Se usa de noche.',
        'Galileo Galilei usó uno para ver las lunas de Júpiter.',
        'Se usa para ver objetos muy lejanos.',
        'Sirve para mirar las estrellas y los planetas.'
      ],
      'Galileo usó uno hace más de 400 años y descubrió cuatro lunas de Júpiter.'
    ],
    [
      '🌍',
      'Globo terráqueo',
      3,
      [
        'Es una esfera.',
        'Gira sobre un soporte.',
        'Suele tener colores azul y verde.',
        'Muestra continentes y océanos.',
        'Es una maqueta del planeta Tierra.'
      ],
      'Un globo terráqueo muestra las proporciones reales de los continentes mejor que un mapa plano.',
      ['Globo']
    ],
    [
      '🔑',
      'Llave',
      2,
      [
        'Es pequeña y de metal.',
        'Tiene dientes.',
        'Se guarda en el bolsillo o en un llavero.',
        'Entra en una cerradura.',
        'Sirve para abrir y cerrar puertas.'
      ],
      'Cada llave tiene dientes con una forma única que encaja con su cerradura.',
      ['Llaves']
    ],
    [
      '🍲',
      'Olla',
      2,
      [
        'Se usa en la cocina.',
        'Es de metal.',
        'Tiene tapa y asas.',
        'Se pone sobre el fuego.',
        'Sirve para cocinar sopas y arroz.'
      ],
      'Se usa para preparar platos como la olla de carne.',
      ['Caldero']
    ]
  ]),

  deck('cuerpo', 'Cuerpo humano', '🧍', [
    [
      '❤️',
      'Corazón',
      1,
      [
        'Soy un músculo.',
        'Estoy en el pecho.',
        'Trabajo todo el día y toda la noche.',
        'Hago bum, bum.',
        'Bombeo la sangre por todo el cuerpo.'
      ],
      'El corazón late unas cien mil veces al día.'
    ],
    [
      '🌬️',
      'Pulmones',
      1,
      [
        'Somos dos.',
        'Estamos en el pecho.',
        'Nos protegen las costillas.',
        'Con nosotros respiramos.',
        'Recibimos el aire y el oxígeno.'
      ],
      'Al respirar, los pulmones envían oxígeno a la sangre.',
      ['Pulmón']
    ],
    [
      '🧠',
      'Cerebro',
      1,
      [
        'Estoy dentro de la cabeza.',
        'Me protege el cráneo.',
        'Controlo lo que hace el cuerpo, incluso cuando duermes.',
        'Con mi ayuda piensas, recuerdas y aprendes.',
        'Soy el centro de mando del cuerpo.'
      ],
      'El cerebro sigue trabajando mientras dormimos.'
    ],
    [
      '🦴',
      'Huesos',
      1,
      [
        'Un bebé tiene más que un adulto.',
        'Un adulto tiene 206.',
        'Soy duro y blanco.',
        'Soy el esqueleto.',
        'Sostengo el cuerpo y lo protejo.'
      ],
      'Un adulto tiene 206 huesos.',
      ['Esqueleto', 'Hueso']
    ],
    [
      '💪',
      'Músculos',
      2,
      [
        'Estoy en todo el cuerpo.',
        'Me contraigo y me relajo.',
        'Mi trabajo es mover los huesos.',
        'Me hago más fuerte con el ejercicio.',
        'Un ejemplo de mí está en tu brazo: el bíceps.'
      ],
      'El corazón es un músculo especial que trabaja sin parar.',
      ['Músculo']
    ],
    [
      '👁️',
      'Ojos',
      1,
      [
        'Somos dos.',
        'Tenemos pestañas.',
        'Se cierran y se abren.',
        'Hay de muchos colores.',
        'Con nosotros se ve.'
      ],
      'Parpadeamos muchas veces por minuto para mantener los ojos húmedos.',
      ['Ojo', 'Vista']
    ],
    [
      '👂',
      'Oídos',
      1,
      [
        'Somos dos.',
        'Tenemos una parte externa llamada oreja.',
        'Con nosotros oímos.',
        'Captamos los sonidos.',
        'También ayudamos a mantener el equilibrio.'
      ],
      'Además de oír, el oído interno ayuda a mantener el equilibrio.',
      ['Oído', 'Orejas', 'Oreja']
    ],
    [
      '🦷',
      'Dientes',
      1,
      [
        'Un adulto tiene 32.',
        'Se pierden los de leche.',
        'Son duros y blancos.',
        'Nos sirven para masticar.',
        'Se cepillan después de comer.'
      ],
      'Los dientes de leche se caen y son reemplazados por los dientes permanentes.',
      ['Diente', 'Muelas']
    ],
    [
      '👅',
      'Lengua',
      1,
      [
        'Estoy en la boca.',
        'Soy un músculo.',
        'Tengo pequeñas papilas.',
        'Ayudo a hablar.',
        'Con mi ayuda sientes los sabores.'
      ],
      'En la lengua hay papilas que detectan lo dulce, lo salado, lo ácido y lo amargo.'
    ],
    [
      '👃',
      'Nariz',
      1,
      [
        'Estoy en el centro de la cara.',
        'Tengo dos orificios.',
        'Por mí entra el aire.',
        'Con mi ayuda sientes los olores.',
        'Me suena cuando estás resfriado.'
      ],
      'El sentido del olfato está muy ligado a los recuerdos.',
      ['Narices']
    ],
    [
      '🖐️',
      'Piel',
      2,
      [
        'Me renuevo constantemente.',
        'Tengo poros.',
        'Sudo cuando hace calor.',
        'Siento el frío, el calor y las cosquillas.',
        'Soy el órgano más grande del cuerpo.'
      ],
      'La piel es el órgano más grande del cuerpo.'
    ],
    [
      '🩸',
      'Sangre',
      2,
      [
        'Circulo por todo el cuerpo.',
        'Me mueve el corazón.',
        'Llevo oxígeno a todas las partes del cuerpo.',
        'Recorro venas y arterias.',
        'Soy roja.'
      ],
      'El color rojo de la sangre se debe a una sustancia llamada hemoglobina.'
    ],
    [
      '🍽️',
      'Estómago',
      2,
      [
        'Estoy dentro del abdomen.',
        'Soy parte del sistema digestivo.',
        'Hago ruidos cuando hay hambre.',
        'Recibo lo que comes.',
        'Aquí empieza a digerirse la comida.'
      ],
      'En el estómago los alimentos se mezclan con jugos que ayudan a digerirlos.'
    ],
    [
      '💧',
      'Riñones',
      3,
      [
        'Somos dos.',
        'Tenemos forma de frijol.',
        'Estamos en la parte baja de la espalda.',
        'Filtramos la sangre.',
        'Producimos la orina.'
      ],
      'Los riñones limpian la sangre y sacan del cuerpo lo que sobra.',
      ['Riñón']
    ],
    [
      '🦴',
      'Columna vertebral',
      3,
      [
        'Estoy en la espalda.',
        'Estoy formada por vértebras.',
        'Protejo un cordón nervioso muy importante.',
        'Me permito doblarme y estar de pie.',
        'Soy los huesos que forman el eje de tu espalda.'
      ],
      'La columna protege la médula espinal, que lleva mensajes entre el cerebro y el cuerpo.',
      ['Espalda', 'Vértebras']
    ]
  ]),

  deck('ciencias', 'Ciencias y naturaleza', '🔬', [
    [
      '☀️',
      'Sol',
      1,
      [
        'Soy una estrella.',
        'Estoy muy lejos, pero te caliento.',
        'Mi luz tarda unos 8 minutos en llegar a la Tierra.',
        'Los planetas giran alrededor de mí.',
        'Sales a verme de día.'
      ],
      'La luz del Sol tarda unos 8 minutos en llegar a la Tierra.'
    ],
    [
      '🌙',
      'Luna',
      1,
      [
        'No tengo luz propia.',
        'Siempre me ves la misma cara.',
        'Cambio de forma durante el mes.',
        'Giro alrededor de la Tierra.',
        'Brillo en el cielo de noche.'
      ],
      'Desde la Tierra siempre vemos la misma cara de la Luna.'
    ],
    [
      '🌎',
      'Tierra',
      1,
      [
        'Soy un planeta.',
        'Tengo agua líquida.',
        'Más de dos tercios de mi superficie es agua.',
        'Tengo continentes y océanos.',
        'Soy el planeta donde vivimos.'
      ],
      'Es el único planeta que sabemos que tiene vida.',
      ['Planeta Tierra']
    ],
    [
      '🧲',
      'Imán',
      1,
      [
        'Tengo dos polos.',
        'Mi fuerza se llama magnetismo.',
        'Con otro imán puedo atraer o rechazar.',
        'Atraigo objetos de hierro.',
        'Me pegas en la refrigeradora.'
      ],
      'Los polos iguales de dos imanes se rechazan y los polos distintos se atraen.',
      ['Iman']
    ],
    [
      '🌈',
      'Arcoíris',
      1,
      [
        'Aparezco cuando hay Sol y lluvia a la vez.',
        'Mi luz se separa en colores.',
        'Tengo siete colores.',
        'Parezco un arco de colores.',
        'Salgo en el cielo después de la lluvia.'
      ],
      'Se forma cuando la luz del Sol atraviesa gotitas de agua y se separa en colores.',
      ['Arco iris']
    ],
    [
      '🐝',
      'Abeja',
      1,
      [
        'Vivo en una colmena.',
        'Mi reina es muy importante.',
        'Visito flores.',
        'Hago miel.',
        'Zumbo y puedo picar.'
      ],
      'Las abejas ayudan a polinizar las flores, y así las plantas dan frutos.'
    ],
    [
      '🌋',
      'Volcán',
      1,
      [
        'Soy una montaña especial.',
        'Dentro de mí hay roca derretida.',
        'Tengo un cráter.',
        'A veces hago erupción.',
        'De mí sale lava.'
      ],
      'Costa Rica tiene varios volcanes activos.'
    ],
    [
      '⚡',
      'Rayo',
      2,
      [
        'Aparezco en las tormentas.',
        'Soy una descarga de electricidad.',
        'Soy luz muy brillante en el cielo.',
        'Después de mí se oye el trueno.',
        'Soy un relámpago.'
      ],
      'El trueno se oye después del relámpago porque la luz viaja más rápido que el sonido.',
      ['Relámpago']
    ],
    [
      '☁️',
      'Nube',
      1,
      [
        'Estoy formada por gotitas de agua muy pequeñas.',
        'Floto en el cielo.',
        'Hay blancas y grises.',
        'De mí puede caer lluvia.',
        'Soy blanca y esponjosa.'
      ],
      'Las nubes están hechas de gotitas de agua o cristalitos de hielo.',
      ['Nubes']
    ],
    [
      '💧',
      'Agua',
      1,
      [
        'Cubro la mayor parte del planeta.',
        'Puedo estar en tres estados: sólido, líquido y gas.',
        'No tengo color, olor ni sabor.',
        'Todos los seres vivos me necesitan.',
        'Me tomas cuando tienes sed.'
      ],
      'El agua puede ser hielo, líquido o vapor.'
    ],
    [
      '🌱',
      'Semilla',
      1,
      [
        'Soy muy pequeña.',
        'Dentro de mí hay una planta diminuta.',
        'Necesito agua, luz y tierra.',
        'Puedo germinar.',
        'Si me siembras, nace una planta.'
      ],
      'Dentro de una semilla hay una plantita lista para crecer.',
      ['Semillas']
    ],
    [
      '🍃',
      'Fotosíntesis',
      3,
      [
        'Ocurre en las hojas.',
        'Necesita luz del Sol, agua y dióxido de carbono.',
        'Es un proceso que hacen las plantas.',
        'Libera oxígeno.',
        'Así las plantas fabrican su alimento.'
      ],
      'Gracias a la fotosíntesis, las plantas producen el oxígeno que respiramos.'
    ],
    [
      '🍎',
      'Gravedad',
      2,
      [
        'No se ve, pero se siente.',
        'Existe en todos los planetas.',
        'Es una fuerza que atrae los objetos.',
        'Hace que la Luna gire alrededor de la Tierra.',
        'Hace que todo caiga al suelo.'
      ],
      'Se dice que Isaac Newton la estudió al ver caer una manzana.'
    ],
    [
      '🔌',
      'Electricidad',
      2,
      [
        'Es una forma de energía.',
        'Viaja por cables.',
        'Debe usarse con mucho cuidado.',
        'En Costa Rica casi toda viene de fuentes renovables, como el agua.',
        'Hace funcionar las luces y los aparatos de la casa.'
      ],
      'En Costa Rica casi toda la electricidad viene de fuentes renovables como el agua, el viento y el calor de la tierra.',
      ['Energía eléctrica', 'Corriente eléctrica']
    ],
    [
      '🌑',
      'Eclipse',
      3,
      [
        'Ocurre pocas veces.',
        'Hay que mirarlo con protección especial.',
        'Intervienen el Sol, la Luna y la Tierra.',
        'La Luna se pone entre el Sol y la Tierra, o la Tierra entre ambos.',
        'Es cuando el Sol o la Luna se oscurecen por un rato.'
      ],
      'Nunca se debe mirar un eclipse solar sin lentes especiales.',
      ['Eclipse solar', 'Eclipse lunar']
    ],
    [
      '♻️',
      'Reciclaje',
      2,
      [
        'Ayuda al planeta.',
        'Se separa en vidrio, papel, plástico y latas.',
        'Reduce la basura.',
        'Los materiales se convierten en cosas nuevas.',
        'Se hace en los centros de acopio.'
      ],
      'Reciclar una lata de aluminio ahorra mucha energía comparada con fabricar una nueva.',
      ['Reciclar']
    ]
  ]),

  deck('america', 'Países y capitales de América', '🌎', [
    [
      '🌮',
      'México',
      1,
      [
        'Estoy en América del Norte.',
        'Tengo pirámides mayas como Chichén Itzá.',
        'Mi comida incluye tacos y tortillas.',
        'Hablo español.',
        'Mi capital es la Ciudad de México.'
      ],
      'En su territorio estuvieron antiguas civilizaciones, como los mayas y los aztecas.',
      ['Mexico']
    ],
    [
      '🌋',
      'Nicaragua',
      1,
      [
        'Tengo un lago enorme llamado Cocibolca.',
        'Tengo muchos volcanes.',
        'Hablo español.',
        'Soy vecina de Costa Rica, al norte.',
        'Mi capital es Managua.'
      ],
      'Su lago Cocibolca es el más grande de Centroamérica.'
    ],
    [
      '🚢',
      'Panamá',
      1,
      [
        'Estoy en el istmo de Centroamérica.',
        'Mi moneda es el balboa y también se usa el dólar.',
        'Soy vecino de Costa Rica, al sur.',
        'Tengo un canal famoso.',
        'Mi capital es Ciudad de Panamá.'
      ],
      'El Canal de Panamá une el océano Atlántico con el Pacífico.',
      ['Panama']
    ],
    [
      '🗽',
      'Estados Unidos',
      1,
      [
        'Estoy en América del Norte.',
        'Tengo cincuenta estados.',
        'Mi idioma principal es el inglés.',
        'Tengo una estatua famosa de la Libertad.',
        'Mi capital es Washington D. C.'
      ],
      'La Estatua de la Libertad fue un regalo de Francia.',
      ['EE. UU.', 'EEUU', 'USA', 'Estados Unidos de América']
    ],
    [
      '🌴',
      'Cuba',
      1,
      [
        'Soy la isla más grande del Caribe.',
        'Hablo español.',
        'Soy famosa por mi música y mis puros.',
        'Estoy en el mar Caribe.',
        'Mi capital es La Habana.'
      ],
      'Es la isla más grande del mar Caribe.'
    ],
    [
      '⚽',
      'Brasil',
      1,
      [
        'Soy el país más grande de América del Sur.',
        'El río Amazonas pasa por mi territorio.',
        'Hablo portugués, no español.',
        'Soy famoso por el fútbol y el carnaval.',
        'Mi capital es Brasilia.'
      ],
      'Es el único país de América del Sur con el portugués como idioma oficial.',
      ['Brazil']
    ],
    [
      '🗿',
      'Guatemala',
      2,
      [
        'Tengo volcanes y lagos.',
        'Estoy en Centroamérica, en el extremo norte.',
        'Tengo ruinas mayas como Tikal.',
        'Mi moneda se llama quetzal.',
        'Mi capital es la Ciudad de Guatemala.'
      ],
      'Su moneda y su ave nacional se llaman igual: quetzal.'
    ],
    [
      '🏔️',
      'Honduras',
      2,
      [
        'Estoy en Centroamérica.',
        'Tengo costa en el Caribe y en el Pacífico.',
        'Tengo ruinas mayas en Copán.',
        'Hablo español.',
        'Mi capital es Tegucigalpa.'
      ],
      'Allí están las ruinas mayas de Copán.'
    ],
    [
      '🌋',
      'El Salvador',
      2,
      [
        'Estoy en Centroamérica.',
        'Soy el país más pequeño de Centroamérica.',
        'Me llaman «el Pulgarcito de América».',
        'Tengo muchos volcanes.',
        'Mi capital es San Salvador.'
      ],
      'Es el país más pequeño de Centroamérica, pero tiene muchos volcanes.',
      ['Salvador']
    ],
    [
      '☕',
      'Colombia',
      2,
      [
        'Mi nombre recuerda a Cristóbal Colón.',
        'Estoy en el norte de América del Sur.',
        'Soy famoso por mis esmeraldas.',
        'Soy famoso por mi café.',
        'Mi capital es Bogotá.'
      ],
      'Su nombre rinde homenaje a Cristóbal Colón.'
    ],
    [
      '🦙',
      'Perú',
      2,
      [
        'Estoy en América del Sur, en la costa del Pacífico.',
        'Aquí vivió el imperio inca.',
        'Tengo llamas y alpacas.',
        'En mi territorio está Machu Picchu.',
        'Mi capital es Lima.'
      ],
      'Allí se encuentra la ciudad inca de Machu Picchu.',
      ['Peru']
    ],
    [
      '💃',
      'Argentina',
      2,
      [
        'Estoy en el sur de América.',
        'Tengo las cataratas del Iguazú y la Patagonia.',
        'Me gustan el asado y el mate.',
        'Soy famosa por el tango.',
        'Mi capital es Buenos Aires.'
      ],
      'El tango nació en la zona de Buenos Aires y Montevideo.'
    ],
    [
      '🏜️',
      'Chile',
      2,
      [
        'Tengo el desierto de Atacama.',
        'Estoy a lo largo de la cordillera de los Andes.',
        'Soy muy largo y angosto.',
        'Estoy en el sur de América, junto al Pacífico.',
        'Mi capital es Santiago.'
      ],
      'Es un país larguísimo y muy angosto, entre los Andes y el océano Pacífico.'
    ],
    [
      '🍁',
      'Canadá',
      2,
      [
        'Estoy en el norte de América.',
        'Tengo dos idiomas oficiales: inglés y francés.',
        'Soy el segundo país más grande del mundo.',
        'Mi bandera tiene una hoja de arce.',
        'Mi capital es Ottawa.'
      ],
      'Es el segundo país más grande del mundo, después de Rusia.',
      ['Canada']
    ],
    [
      '🏝️',
      'Belice',
      3,
      [
        'Estoy en Centroamérica.',
        'Tengo la segunda barrera de coral más grande del mundo.',
        'Soy el único país de Centroamérica donde el idioma oficial es el inglés.',
        'Estoy junto al mar Caribe.',
        'Mi capital es Belmopán.'
      ],
      'Es el único país centroamericano con el inglés como idioma oficial.',
      ['Belize']
    ],
    [
      '💦',
      'Venezuela',
      3,
      [
        'Estoy en el norte de América del Sur.',
        'Tengo costa en el mar Caribe.',
        'Tengo el Salto Ángel, una catarata altísima.',
        'Mi nombre significa «pequeña Venecia».',
        'Mi capital es Caracas.'
      ],
      'En su territorio está el Salto Ángel, la catarata más alta del mundo.'
    ],
    [
      '🧉',
      'Uruguay',
      3,
      [
        'Soy uno de los países más pequeños de América del Sur.',
        'Estoy entre Argentina y Brasil.',
        'Me gusta el mate y el fútbol.',
        'Tengo costa en el océano Atlántico.',
        'Mi capital es Montevideo.'
      ],
      'Fue sede del primer Mundial de fútbol, en 1930.'
    ],
    [
      '🏞️',
      'Paraguay',
      3,
      [
        'Estoy en el centro de América del Sur.',
        'Hablo español y también guaraní.',
        'Soy un país sin salida al mar.',
        'Me rodean Argentina, Brasil y Bolivia.',
        'Mi capital es Asunción.'
      ],
      'Además del español, su idioma oficial es el guaraní.'
    ],
    [
      '🐢',
      'Ecuador',
      3,
      [
        'Estoy en América del Sur.',
        'Mi nombre recuerda a una línea imaginaria.',
        'Tengo las islas Galápagos.',
        'La línea del ecuador pasa por mi territorio.',
        'Mi capital es Quito.'
      ],
      'Las islas Galápagos, con sus tortugas gigantes, pertenecen a este país.'
    ],
    [
      '🏃',
      'Jamaica',
      3,
      [
        'Soy una isla del Caribe.',
        'Mi idioma oficial es el inglés.',
        'Soy famosa por el reggae.',
        'Aquí nació el cantante Bob Marley.',
        'Mi capital es Kingston.'
      ],
      'En esta isla nació el reggae.'
    ],
    [
      '🏖️',
      'República Dominicana',
      3,
      [
        'Estoy en una isla del Caribe, compartida con otro país.',
        'Hablo español.',
        'Mi capital fue la primera ciudad colonial de América.',
        'El béisbol y el merengue son muy populares.',
        'Mi capital es Santo Domingo.'
      ],
      'Comparte la isla La Española con Haití.',
      ['Dominicana']
    ],
    [
      '🏝️',
      'Haití',
      3,
      [
        'Estoy en una isla del Caribe, compartida con otro país.',
        'Fui el primer país de América Latina en independizarse.',
        'Mis idiomas oficiales son el francés y el criollo haitiano.',
        'Comparto la isla con la República Dominicana.',
        'Mi capital es Puerto Príncipe.'
      ],
      'Fue el primer país de América Latina en lograr su independencia.',
      ['Haiti']
    ]
  ]),

  deck('tradiciones', 'Comidas y tradiciones', '🎉', [
    [
      '🍚',
      'Gallo pinto',
      1,
      [
        'Es muy típico de Costa Rica.',
        'Se come en el desayuno.',
        'Lleva cebolla, chile dulce y culantro.',
        'Se prepara con arroz y frijoles.',
        'Mezcla arroz y frijoles y a veces lo acompañan huevo y natilla.'
      ],
      'Es el plato más típico del desayuno costarricense.'
    ],
    [
      '🌽',
      'Tamal',
      1,
      [
        'Se prepara en grupo, en familia.',
        'Se envuelve en hojas de plátano.',
        'Su masa es de maíz.',
        'Se hace en diciembre.',
        'Es un plato típico de Navidad.'
      ],
      'En diciembre las familias se reúnen a hacer tamales.',
      ['Tamales']
    ],
    [
      '🍽️',
      'Casado',
      1,
      [
        'Es un almuerzo.',
        'Se sirve en un solo plato.',
        'Lleva arroz y frijoles.',
        'Lleva ensalada, plátano maduro y carne o pollo.',
        'Dicen que se llama así porque arroz y frijoles van «casados».'
      ],
      'Según una explicación popular, se llama «casado» porque arroz y frijoles van siempre juntos.',
      ['Plato casado']
    ],
    [
      '🍲',
      'Olla de carne',
      2,
      [
        'Es un plato de familia.',
        'Se cocina por mucho tiempo.',
        'Lleva yuca, plátano, chayote y elote.',
        'Lleva carne de res.',
        'Es una sopa grande y se come con arroz.'
      ],
      'Es una de las sopas más típicas de Costa Rica.'
    ],
    [
      '🍩',
      'Rosquillas',
      2,
      [
        'Se hornean.',
        'Su masa lleva maíz y queso.',
        'Tienen forma de anillo.',
        'Se comen con café.',
        'Son una merienda típica.'
      ],
      'Son una merienda tradicional que acompaña muy bien al café.',
      ['Rosquilla']
    ],
    [
      '🥤',
      'Agua dulce',
      1,
      [
        'Se toma caliente o fría.',
        'Se prepara con tapa de dulce.',
        'Viene de la caña de azúcar.',
        'Es una bebida típica.',
        'Se toma con pan o con queso.'
      ],
      'Se prepara disolviendo tapa de dulce en agua.',
      ['Agua de panela', 'Agua dulce con tapa']
    ],
    [
      '🎭',
      'Mascarada',
      2,
      [
        'Se baila en las calles.',
        'Hay música de cimarrona.',
        'Se usan máscaras de papel y de cartón.',
        'Se celebra el 31 de octubre.',
        'Es una tradición con gigantes y máscaras.'
      ],
      'El 31 de octubre se celebra el Día de la Mascarada Tradicional Costarricense.',
      ['Mascaradas', 'Mascarada costarricense']
    ],
    [
      '🏮',
      'Faroles',
      1,
      [
        'Se usan de noche.',
        'Los llevan niños y niñas.',
        'Se pasean el 14 de setiembre.',
        'Tienen una luz adentro.',
        'Se pasean en la víspera de la Independencia.'
      ],
      'La noche del 14 de setiembre los niños recorren las calles con faroles.',
      ['Farolitos', 'Desfile de faroles']
    ],
    [
      '⭐',
      'Portal de Belén',
      2,
      [
        'Se arma en las casas.',
        'Se arma en diciembre.',
        'Tiene figuras de barro.',
        'Recuerda el nacimiento de Jesús.',
        'Se pone con pesebre, estrella y musgo.'
      ],
      'En Navidad es común armar el portal en la sala de la casa.',
      ['Portal', 'Pesebre', 'Nacimiento']
    ],
    [
      '🎺',
      'Cimarrona',
      3,
      [
        'Toca en las fiestas y en los desfiles.',
        'Es un grupo de músicos.',
        'Usa trompetas, tubas y tambores.',
        'Toca música alegre y de baile.',
        'Es una banda popular de Costa Rica.'
      ],
      'Es una banda popular que toca en turnos, desfiles y mascaradas.',
      ['Banda cimarrona']
    ],
    [
      '💃',
      'Punto guanacasteco',
      3,
      [
        'Es un baile en pareja.',
        'Se baila con trajes típicos.',
        'Las mujeres usan faldas largas de colores.',
        'Es baile típico de Guanacaste.',
        'Es el baile típico de Costa Rica.'
      ],
      'Es un baile típico de Costa Rica que nació en Guanacaste.',
      ['El punto guanacasteco', 'Punto']
    ],
    [
      '🌹',
      'Día de la Madre',
      1,
      [
        'Se celebra en un mes de invierno.',
        'Es un feriado.',
        'Se regalan flores y tarjetas.',
        'Es el 15 de agosto.',
        'Es el día de mamá.'
      ],
      'En Costa Rica se celebra el 15 de agosto.',
      ['Día de las madres']
    ],
    [
      '🎈',
      'Día del Niño',
      1,
      [
        'Se celebra en el mes de la Independencia.',
        'Es en setiembre.',
        'Hay fiestas y juegos.',
        'Se celebra el 9 de setiembre.',
        'Es la fiesta de los niños y las niñas.'
      ],
      'En Costa Rica se celebra el 9 de setiembre.',
      ['Día de los niños']
    ],
    [
      '🐂',
      'Desfile de boyeros',
      3,
      [
        'Se hace en Escazú.',
        'Se celebra en marzo, el segundo domingo.',
        'Participan carretas muy bonitas.',
        'Hay bueyes que halan las carretas.',
        'Es un homenaje a los boyeros y a las carretas.'
      ],
      'Cada año, en Escazú, se celebra el Día Nacional del Boyero con un gran desfile.',
      ['Día del Boyero', 'Boyeros']
    ],
    [
      '🎄',
      'Árbol de Navidad',
      1,
      [
        'Aparece en las casas en diciembre.',
        'Se adorna con luces y bolas de colores.',
        'Es verde y tiene forma de triángulo.',
        'Debajo de él se ponen los regalos.',
        'Tiene una estrella o un ángel en la punta.'
      ],
      'Muchas familias lo arman a comienzos de diciembre y lo desarman en enero.',
      ['Arbolito de Navidad', 'Árbol navideño']
    ]
  ])
]
