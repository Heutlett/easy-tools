import type { Grade } from '../../content/types'

export type Level = 1 | 2 | 3

export interface Twister {
  id: string
  /** Grado sugerido */
  grade: Grade
  /** Dificultad para pronunciarlo: 1 fácil, 2 media, 3 difícil */
  level: Level
  text: string
}

/*
 * Trabalenguas. Los tradicionales son de dominio público (tradición oral hispana); los demás son
 * inventados para esta app. Cada fila: [grado sugerido, dificultad 1–3, texto].
 */
const rows: [Grade, Level, string][] = [
  // ───────── 1.º y 2.º: cortos ─────────
  [1, 1, 'Mi mamá me mima y yo mimo a mi mamá.'],
  [1, 1, 'El pato pinta un plato.'],
  [1, 1, 'Pepe pela papas para papá.'],
  [1, 1, 'La rana Ramona rema en la ría.'],
  [1, 1, 'Susana sirve sopa sabrosa en la sala.'],
  [1, 1, 'Tito toma té tibio.'],
  [1, 1, 'Un tigre, dos tigres, tres tigres.'],
  [1, 2, 'Pablito clavó un clavito. ¿Qué clavito clavó Pablito?'],
  [1, 1, 'El gato goloso guarda gotas de miel.'],
  [1, 1, 'Cuatro cuentos cuentan cuatro cuentistas.'],
  [2, 1, 'Lola lava la lana limpia.'],
  [2, 1, 'La luna de Luisa luce en la laguna.'],
  [2, 1, 'Doña Dora dibuja dos dados dorados.'],
  [2, 1, 'Mi mono Memo come mango maduro.'],
  [2, 2, 'Pepe Pecas pica papas con un pico. Con un pico pica papas Pepe Pecas.'],
  [2, 2, 'Como poco coco como, poco coco compro.'],
  [2, 2, 'Si Pancha plancha con cuatro planchas, ¿con cuántas planchas plancha Pancha?'],
  [2, 1, 'Nena nada nueve minutos en la nueva piscina.'],
  [
    2,
    2,
    'Un burro comía berros y el perro se los quitó. El burro lanzó un rebuzno por los berros que perdió.'
  ],
  [2, 2, 'Fabiola fabrica flautas finas de fina fibra.'],
  [2, 1, 'El tucán tico toma té tibio en su taza.'],
  [2, 1, 'Cuando cuentes cuentos, cuenta cuántos cuentos cuentas.'],
  [2, 1, 'Tres platos de trigo para tres tigres tranquilos.'],
  // ───────── 3.º y 4.º ─────────
  [
    3,
    2,
    'Compadre, cómpreme un coco. Compadre, no compro coco, porque como poco coco, como poco coco compro.'
  ],
  [3, 2, 'Tres tristes tigres tragaban trigo en un trigal.'],
  [3, 2, 'Rosa Rizo recoge rosas rojas en el rincón del rancho.'],
  [3, 2, 'El perro de San Roque no tiene rabo, porque Ramón Ramírez se lo ha cortado.'],
  [3, 2, 'Los siete sapos saltaban sobre siete sillas sucias.'],
  [3, 1, 'La tortuga tímida toma el sol tranquila en la tarde tibia.'],
  [3, 2, 'El perezoso pasea despacio por el parque y piensa en pasear por otro parque.'],
  [3, 2, 'Una mariposa morada merodea por la mata de mandarinas maduras.'],
  [3, 2, 'Pedro Pérez pinta piñas pequeñas para pagar su plato de pasta.'],
  [3, 2, 'Julia juega en el jardín con jabones, jirafas y juguetes.'],
  [
    3,
    3,
    'Erre con erre, cigarro; erre con erre, barril. Rápido ruedan los carros cargados de azúcar del ferrocarril.'
  ],
  [3, 2, 'Treinta y tres tigres tragaban trigo en tres tristes trastos.'],
  [
    4,
    2,
    'Paco Peco, chico rico, insultaba como un loco a su tío Federico, y este le dijo: «Poco a poco, Paco Peco, poco a poco».'
  ],
  [
    4,
    2,
    'El cielo está nublado, ¿quién lo desnublará? El desnublador que lo desnuble buen desnublador será.'
  ],
  [
    4,
    3,
    'El cielo está enladrillado. ¿Quién lo desenladrillará? El desenladrillador que lo desenladrille, buen desenladrillador será.'
  ],
  [4, 2, 'Pablo Pérez pasó por el puente y pidió pan para el pájaro pobre.'],
  [4, 3, 'Tres leñadores tristes trozaron treinta y tres troncos.'],
  [4, 2, 'Un tucán toca el tambor en la tarde y trae tres tortillas tostadas.'],
  [4, 2, 'La culebra cruza la calle con calma, cargando una cuerda colorada.'],
  [
    4,
    2,
    'Cuando cuentes cuentos, cuenta cuántos cuentos cuentas, porque si no cuentas cuántos cuentos cuentas, nunca sabrás cuántos cuentos contaste.'
  ],
  [4, 3, 'Mi mamá me mima mucho y me mete mangos maduros en la mochila.'],
  [4, 2, 'El quetzal quiere queso, pero el pájaro prefiere piña.'],
  [4, 2, 'Fernando friega, fregó y fregará fuertemente la fuente fría de la finca.'],
  [4, 2, 'Las lluvias de la selva llenan los lagos y las lagunas.'],
  // ───────── 5.º y 6.º: largos y enredados ─────────
  [
    5,
    3,
    'Pedro Pérez Pereira, pobre pintor portugués, pinta pinturas por poco precio para pasear por París.'
  ],
  [
    5,
    3,
    'María Chucena techaba su choza, y un techador que por allí pasaba le dijo: «María Chucena, ¿techas tu choza o techas la ajena?». «Ni techo mi choza ni techo la ajena, que techo la choza de María Chucena».'
  ],
  [
    5,
    3,
    'Guerra tenía una parra y Parra tenía una perra. La perra de Parra rompió la parra de Guerra, y Guerra regañó a la perra de Parra.'
  ],
  [5, 3, 'El que poco coco come, poco coco compra; el que poco coco compra, poco coco come.'],
  [
    5,
    3,
    'Parra con parra, carro con carro; el carro de Parra corre rápido por la carretera del cerro.'
  ],
  [5, 3, 'Ramón Ramírez recorre rápido la ruta rocosa, y el río revuelto retumba entre las rocas.'],
  [5, 2, 'El conejo cojo come cuatro coles cortas y las comparte con el cangrejo.'],
  [
    5,
    3,
    'Cuando el cartero Carlos cuenta cartas, comenta cuántas cartas cuenta y cuántas cartas cuesta contar.'
  ],
  [5, 3, 'La brisa bonita besa los bambúes de la bahía y baila con la barca.'],
  [5, 2, 'Si el sapo se asoma al sol sin sombrero, sentirá sed y sudará sin sosiego.'],
  [5, 3, 'Tres tigres trigueños trepaban tres troncos tristes y trituraban trece trozos de trigo.'],
  [5, 3, 'Gerardo, el gigante generoso, generalmente gira y gime gentilmente en la gélida gruta.'],
  [
    6,
    3,
    'Si seis sabios supieran sumar sin sudar, cinco sabios sabrían simplificar sus sumas sin sentir sed.'
  ],
  [
    6,
    3,
    'Doña Pancha preparaba pan con piña, pero, por la prisa, pisó la pasta y perdió pan, piña y paciencia.'
  ],
  [6, 3, 'El volcán volvió a bostezar y vio vibrar la vasta vega verde.'],
  [6, 3, 'Fray Francisco, fiel frutero, frota fresas frescas frente a la fría fuente de la finca.'],
  [6, 3, 'Cuando el cuervo cruza la cuesta, cuenta cuarenta cuevas cubiertas de cuarzo.'],
  [6, 3, 'Yo llamo a Yolanda y ella llega ya, con la llave amarilla del cayuco.'],
  [
    6,
    3,
    'Un tigre trajo trece trozos de trigo tostado a tres tristes tapires tras el temporal de truenos.'
  ],
  [6, 3, 'El lobo lento lleva al loro a la loma, y allí lloran de risa las lagartijas.'],
  [
    6,
    3,
    'El arzobispo de Constantinopla quiere desarzobispoconstantinopolitanizarse. El desarzobispoconstantinopolitanizador que lo desarzobispoconstantinopolitanice, buen desarzobispoconstantinopolitanizador será.'
  ]
]

export const twisters: Twister[] = rows.map(([grade, level, text], i) => ({
  id: `tw-${i + 1}`,
  grade,
  level,
  text
}))
