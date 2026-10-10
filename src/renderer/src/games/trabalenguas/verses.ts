import type { Grade } from '../../content/types'

export interface Verse {
  id: string
  grade: Grade
  /** Rima consonante (terminan igual) o asonante (solo coinciden las vocales) */
  kind: 'consonante' | 'asonante'
  /** Versos; en uno de ellos, ___ marca la palabra que falta */
  lines: string[]
  /** La palabra que completa la rima, y tres que no riman */
  options: [string, string, string, string]
  /** Palabra del verso anterior con la que rima la que falta */
  partner: string
}

/*
 * Versos para completar. Los tradicionales (marcados «tradicional») son de dominio público; los demás
 * son originales de esta app.
 * Cada fila: [grado, 'c' | 'a', versos separados por «/», palabra con la que rima, correcta, 3 incorrectas]
 */
const rows: [Grade, 'c' | 'a', string, string, string, string, string, string][] = [
  // ───────── 1.º y 2.º ─────────
  [
    1,
    'c',
    'Sana, sana, colita de rana,/si no sanas hoy,/sanarás ___.',
    'rana',
    'mañana',
    'pronto',
    'ahora',
    'luego'
  ], // tradicional
  [
    1,
    'c',
    'Salta, salta, la rana,/que ya llegó la ___.',
    'rana',
    'mañana',
    'noche',
    'tarde',
    'lluvia'
  ],
  [
    1,
    'c',
    'En mi jardín hay una rosa/y sobre ella una ___.',
    'rosa',
    'mariposa',
    'abeja',
    'araña',
    'hormiga'
  ],
  [
    1,
    'c',
    'En la noche brilla la luna/y el bebé duerme en su ___.',
    'luna',
    'cuna',
    'cama',
    'casa',
    'silla'
  ],
  [
    1,
    'c',
    'Pica, pica, la gallina,/que se come la ___.',
    'gallina',
    'harina',
    'fruta',
    'maíz',
    'pan'
  ],
  [
    1,
    'c',
    'Mi mamá me hizo un pastel/con azúcar y ___.',
    'pastel',
    'miel',
    'pan',
    'leche',
    'fresa'
  ],
  [
    1,
    'c',
    'Quiero un helado de fresa/sentado a la ___.',
    'fresa',
    'mesa',
    'silla',
    'playa',
    'sombra'
  ],
  [
    1,
    'c',
    'Me gusta la lluvia en mi ventana/y jugar con ella por la ___.',
    'ventana',
    'mañana',
    'tarde',
    'noche',
    'calle'
  ],
  [
    1,
    'c',
    'El payaso con su nariz/siempre está muy ___.',
    'nariz',
    'feliz',
    'triste',
    'serio',
    'alto'
  ],
  [
    1,
    'c',
    'Corre, corre el ratón/y se esconde en el ___.',
    'ratón',
    'rincón',
    'queso',
    'agujero',
    'zapato'
  ],
  [
    1,
    'c',
    'Un mono muy risueño/se despierta con ___.',
    'risueño',
    'sueño',
    'hambre',
    'frío',
    'calor'
  ],
  [
    1,
    'c',
    'Mi abuela teje con lana/un gorro para mi ___.',
    'lana',
    'hermana',
    'mamá',
    'tía',
    'nieta'
  ],
  [
    2,
    'c',
    'Arroz con leche, me quiero casar/con una señorita de San Nicolás./Que sepa coser, que sepa bordar,/que sepa abrir la puerta para ir a ___.',
    'bordar',
    'jugar',
    'dormir',
    'comer',
    'leer'
  ], // tradicional
  [
    2,
    'c',
    'Naranja dulce,/limón partido,/dame un abrazo/que yo te ___.',
    'partido',
    'pido',
    'doy',
    'quiero',
    'mando'
  ], // tradicional
  [
    2,
    'c',
    'Mi bicicleta es nueva/y la cuido cuando ___.',
    'nueva',
    'llueva',
    'sale',
    'pasa',
    'amanece'
  ],
  [2, 'c', 'Cada mañana/me despierta la ___.', 'mañana', 'campana', 'luna', 'lluvia', 'gallina'],
  [
    2,
    'c',
    'Mi perro es muy juguetón/y duerme sobre el ___.',
    'juguetón',
    'colchón',
    'piso',
    'tapete',
    'sofá'
  ],
  [
    2,
    'c',
    'La ardilla sube al pino/y sigue su ___.',
    'pino',
    'camino',
    'semilla',
    'comida',
    'ramita'
  ],
  [
    2,
    'c',
    'Una abeja en la flor/busca el néctar con ___.',
    'flor',
    'amor',
    'cuidado',
    'prisa',
    'sed'
  ],
  [
    2,
    'c',
    'La rana salta en la charca/y se sube a una ___.',
    'charca',
    'barca',
    'hoja',
    'piedra',
    'rama'
  ],
  // ───────── 3.º ─────────
  [
    3,
    'c',
    'Hoy la lluvia cae sin parar/y yo me quedo a ___.',
    'parar',
    'jugar',
    'leer',
    'dormir',
    'comer'
  ],
  [3, 'c', 'Me dijo mi abuela/que vaya a la ___.', 'abuela', 'escuela', 'casa', 'tienda', 'plaza'],
  [
    3,
    'c',
    'Salió la tortuga a pasear/y se fue a bañar al ___.',
    'pasear',
    'mar',
    'río',
    'lago',
    'estanque'
  ],
  [
    3,
    'c',
    'El gallo canta al amanecer/y los niños van a ___.',
    'amanecer',
    'aprender',
    'jugar',
    'dormir',
    'cantar'
  ],
  [
    3,
    'c',
    'Los domingos con mi abuelo/miramos las nubes del ___.',
    'abuelo',
    'cielo',
    'campo',
    'monte',
    'parque'
  ],
  [
    3,
    'c',
    'Hoy el día está caliente/y bebo agua de la ___.',
    'caliente',
    'fuente',
    'llave',
    'taza',
    'jarra'
  ],
  [
    3,
    'c',
    'Hoy me siento muy cansado/porque he corrido y ___.',
    'cansado',
    'jugado',
    'dormido',
    'comida',
    'saltar'
  ],
  [
    3,
    'c',
    'Si la lluvia cae en el jardín,/florecen la rosa y el ___.',
    'jardín',
    'jazmín',
    'clavel',
    'lirio',
    'girasol'
  ],
  // ───────── 4.º ─────────
  [
    4,
    'c',
    'En la finca de mi abuelo/hay maíz, café y frijol;/y al caer la tarde, el cielo/se despide con el ___.',
    'frijol',
    'sol',
    'viento',
    'día',
    'mar'
  ],
  [
    4,
    'c',
    'Mi escuela está en lo alto/de una colina verde;/desde allí se ve el valle/y el río que se ___.',
    'verde',
    'pierde',
    'cae',
    'aleja',
    'cruza'
  ],
  [
    4,
    'c',
    'El tucán lleva en el pico/los colores del verano;/y en la selva, sin descanso,/lo despierta el sol ___.',
    'verano',
    'temprano',
    'tarde',
    'siempre',
    'pronto'
  ],
  [
    4,
    'c',
    'Mi tío es un gran cartero/y camina todo el día;/lleva cartas por el pueblo/con su sombrero y ___.',
    'día',
    'alegría',
    'bolsa',
    'prisa',
    'sed'
  ],
  [
    4,
    'c',
    'El grillo canta de noche/junto a la laguna;/mientras duermo, me acompaña/la luz de la ___.',
    'laguna',
    'luna',
    'estrella',
    'nube',
    'lámpara'
  ],
  // ───────── 5.º y 6.º (rima asonante) ─────────
  [
    5,
    'a',
    'Cuando el volcán despierta/tiembla toda la montaña,/y las nubes de ceniza/cubren la ___.',
    'montaña',
    'mañana',
    'llanura',
    'tarde',
    'selva'
  ],
  [
    5,
    'a',
    'Por la orilla del río/camina despacio el sapo;/la luna se mira en el agua/y le sonríe de ___.',
    'sapo',
    'lado',
    'frente',
    'cerca',
    'lejos'
  ],
  [
    5,
    'a',
    'Más vale pájaro en mano/que ciento ___.',
    'mano',
    'volando',
    'cantar',
    'dormidos',
    'cerca'
  ], // refrán
  [
    5,
    'a',
    'Quien a buen árbol se arrima,/buena sombra lo ___.',
    'arrima',
    'cobija',
    'refresca',
    'protege',
    'cubre'
  ], // refrán
  [
    5,
    'a',
    'En el parque de mi barrio/juegan niños y palomas;/yo me siento en una banca/a leer mis ___.',
    'palomas',
    'historias',
    'cuentos',
    'libros',
    'revistas'
  ],
  [
    5,
    'c',
    'Sale el sol sobre la costa/y despierta a los pescadores;/las olas llevan sus redes/entre espumas y ___.',
    'pescadores',
    'colores',
    'peces',
    'barcos',
    'redes'
  ],
  [
    6,
    'c',
    'Entre las nubes del monte/se esconde el quetzal dormido;/el viento canta bajito/para no hacer ningún ___.',
    'dormido',
    'ruido',
    'canto',
    'paso',
    'gesto'
  ],
  [
    6,
    'a',
    'Junto al fogón de la abuela/huele a tortillas y pan;/yo escucho cuentos de antaño/y no me quiero ___.',
    'pan',
    'levantar',
    'ir',
    'ver',
    'dormir'
  ],
  [
    6,
    'c',
    'La lluvia toca en el techo/su tambor de plata fría;/dentro de casa, en silencio,/la tarde se vuelve ___.',
    'fría',
    'poesía',
    'larga',
    'dulce',
    'triste'
  ],
  [
    6,
    'a',
    'El mar me trae las historias/de lugares muy lejanos,/de barcos, vientos y sirenas,/de marineros ___.',
    'lejanos',
    'sabios',
    'valientes',
    'tristes',
    'viejos'
  ]
]

export const verses: Verse[] = rows.map(([grade, k, text, partner, ...options], i) => ({
  id: `vs-${i + 1}`,
  grade,
  kind: k === 'c' ? 'consonante' : 'asonante',
  lines: text.split('/'),
  options: options as [string, string, string, string],
  partner
}))
