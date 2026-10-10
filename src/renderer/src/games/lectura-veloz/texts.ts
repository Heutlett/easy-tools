import type { Grade } from '../../content/types'

/**
 * Textos cortos para «Lectura cronometrada». Todos son originales (escritos para esta app), así que se pueden usar
 * y copiar libremente. Los datos de Costa Rica son hechos que no cambian con el tiempo.
 * Los párrafos se separan con una línea en blanco; en las rimas, cada verso va en su línea.
 */
export type TextKind = 'Cuento' | 'Costa Rica' | 'Rima'

export interface ReadingText {
  id: string
  grade: Grade
  kind: TextKind
  title: string
  text: string
}

export const TEXTS: ReadingText[] = [
  {
    id: 'g1-tomas',
    grade: 1,
    kind: 'Cuento',
    title: 'El gato Tomás',
    text: `Tomás es un gato pequeño. Tiene el pelo negro y los ojos verdes.

Le gusta dormir en el sillón de mi casa. Cuando llega la noche, Tomás sale al patio. Mira la luna y camina sin hacer ruido.

Después vuelve a su cama y se duerme.`
  },
  {
    id: 'g1-gallo-pinto',
    grade: 1,
    kind: 'Costa Rica',
    title: 'El gallo pinto',
    text: `En Costa Rica, muchas familias desayunan gallo pinto. Se hace con arroz y frijoles.

Mi mamá lo prepara en la mañana. Huele muy rico. Yo lo como con huevo y un poco de queso.

Mi abuela dice que el gallo pinto da fuerza para jugar todo el día.`
  },
  {
    id: 'g1-luna',
    grade: 1,
    kind: 'Rima',
    title: 'La luna',
    text: `La luna, la luna,
sale por la loma.
Se mira en el río
y se vuelve paloma.

Los grillos cantan,
la noche se aquieta.
Mi gato se duerme
sobre mi chaqueta.

Duerme, florecita,
duerme, mi lorito.
Mañana el sol sale
con un sombrerito.`
  },
  {
    id: 'g1-escuela',
    grade: 1,
    kind: 'Cuento',
    title: 'Mi escuela',
    text: `Mi escuela está en el pueblo. Allí tengo muchos amigos.

La maestra nos lee cuentos y nos enseña a escribir. En el recreo jugamos en el patio. Me gusta mucho mi escuela.

Mi mejor amiga se llama Lucía. Ella me presta sus colores y yo le presto mi regla.`
  },
  {
    id: 'g2-rita',
    grade: 2,
    kind: 'Cuento',
    title: 'La rana Rita',
    text: `Rita es una rana verde que vive junto a una charca. Una tarde empezó a llover y Rita saltó de alegría.

Salto tras salto, llegó hasta una hoja grande. Se subió y se sintió como una capitana en su barco. Sus amigos los patos nadaron a su lado.

Todos jugaron bajo la lluvia hasta que salió el arcoíris.`
  },
  {
    id: 'g2-yigüirro',
    grade: 2,
    kind: 'Costa Rica',
    title: 'El yigüirro',
    text: `El yigüirro es el ave nacional de Costa Rica. Tiene plumas de color café y canta muy bonito cuando llega la época de lluvias.

Casi siempre lo vemos en los jardines y en los parques. Hace su nido con palitos, hojas y barro. Los campesinos dicen que su canto anuncia el invierno.`
  },
  {
    id: 'g2-lluvia',
    grade: 2,
    kind: 'Rima',
    title: 'La lluvia',
    text: `Cae la lluvia en el tejado,
toc, toc, toc, toc, toc.
Los charcos son espejos
donde salto yo.

Mis botas amarillas
hacen chap, chap, chap.
¡Qué lindo es mojarse
sin nada que temer!

Cuando el sol regresa
el cielo se pinta.
Un arco de colores
sonríe en la colina.`
  },
  {
    id: 'g3-perezoso',
    grade: 3,
    kind: 'Cuento',
    title: 'El perezoso y el pájaro',
    text: `Un perezoso colgaba de una rama muy alta. Un pájaro llegó volando y le preguntó por qué se movía tan despacio.

El perezoso sonrió y respondió que así veía mejor el bosque. El pájaro se quedó pensando.

Esa tarde dejó de volar con prisa y descubrió flores, mariposas y frutas que antes nunca había visto. Desde entonces, los dos son grandes amigos.`
  },
  {
    id: 'g3-volcanes',
    grade: 3,
    kind: 'Costa Rica',
    title: 'Los volcanes',
    text: `En Costa Rica hay varios volcanes. El Irazú, en la provincia de Cartago, es el volcán activo más alto del país.

Desde su cima, en días despejados, se pueden ver el mar Caribe y el océano Pacífico. El Poás tiene un cráter enorme que lanza vapor.

Visitar un volcán nos recuerda lo poderosa que es la naturaleza.`
  },
  {
    id: 'g3-reloj',
    grade: 3,
    kind: 'Rima',
    title: 'El reloj',
    text: `Tic, tac, tic, tac,
dice el reloj de mi casa.
Por la mañana me despierta,
por la noche me abraza.

Tic, tac, tic, tac,
la tarde ya se va.
Mañana será otro día,
¡vamos a jugar!

Las manecillas giran,
no se quieren parar.
Mientras yo les sonrío
ellas siguen sin cesar.`
  },
  {
    id: 'g4-regalo',
    grade: 4,
    kind: 'Cuento',
    title: 'El mejor regalo',
    text: `Camila quería comprar un regalo para el cumpleaños de su abuela, pero solo tenía unas pocas monedas. Pensó en las flores de la feria, en los dulces del mercado y en los libros de la tienda. Nada alcanzaba.

Entonces recordó que su abuela siempre decía que lo hecho a mano vale más. Camila buscó papel de colores, tijeras y pegamento. Durante la tarde dibujó la casa de la finca y escribió una carta.

Cuando la abuela la leyó, sus ojos brillaron y abrazó a Camila con mucha fuerza.`
  },
  {
    id: 'g4-tortuguero',
    grade: 4,
    kind: 'Costa Rica',
    title: 'Las tortugas de Tortuguero',
    text: `En la costa del Caribe de Costa Rica está el Parque Nacional Tortuguero. A esta playa llegan las tortugas verdes para poner sus huevos.

Cuando cae la noche, las hembras salen del mar, cavan un hueco en la arena y depositan sus huevos. Después los cubren y regresan al agua.

Unos dos meses después, las tortuguitas nacen y corren hacia el mar. Gracias a los guardaparques y a los visitantes cuidadosos, esta tradición natural continúa cada año.`
  },
  {
    id: 'g4-pais',
    grade: 4,
    kind: 'Rima',
    title: 'Mi país',
    text: `Tengo un país pequeño,
con volcanes y con mar,
con montañas de neblina
y ríos para soñar.

Tiene aves de colores,
flores de mil olores,
y un pueblo que sabe siempre
decir «pura vida» con amor.

Tiene un mar en cada orilla,
dos océanos que cantan,
y en el centro un corazón
que late con las montañas.`
  },
  {
    id: 'g5-biblioteca',
    grade: 5,
    kind: 'Cuento',
    title: 'La biblioteca del pueblo',
    text: `Hace mucho tiempo, en un pueblo de montaña, la biblioteca estaba casi vacía. Los estudiantes preferían jugar en la calle y pocos se acercaban a los libros.

Un día, la bibliotecaria Marta decidió organizar una tarde de lectura bajo el árbol de mango. Llevó cojines, una jarra de fresco y sus cuentos favoritos. Poco a poco llegaron los niños.

Escucharon historias de piratas, de volcanes y de animales que hablaban. Al terminar, todos querían llevarse un libro a casa. Desde entonces, la biblioteca se llenó de voces, risas y páginas que pasaban sin parar.

Marta sonrió, porque entendió que leer en compañía es una fiesta. El árbol de mango, testigo de aquellas tardes, hoy tiene una banca para cada lector.`
  },
  {
    id: 'g5-ejercito',
    grade: 5,
    kind: 'Costa Rica',
    title: 'Un país sin ejército',
    text: `El primero de diciembre de 1948, Costa Rica tomó una decisión que la hizo famosa en el mundo: abolió su ejército. Ese día, José Figueres Ferrer golpeó con un mazo una pared del cuartel Bellavista, como símbolo del fin de las armas.

Aquel cuartel se convirtió después en el Museo Nacional. Desde entonces, el país pudo destinar más dinero a la educación y a la salud. En 1949, la nueva Constitución confirmó esta decisión.

Hoy los estudiantes visitan el museo para conocer cómo era la vida de antes.

Por eso muchas personas dicen que Costa Rica prefiere los libros a las armas.`
  },
  {
    id: 'g6-rio',
    grade: 6,
    kind: 'Cuento',
    title: 'El río que quería llegar al mar',
    text: `En lo alto de una montaña nació un riachuelo diminuto. Cada mañana soñaba con llegar al mar, pero el camino parecía interminable.

Primero chocó contra las piedras y creyó que no podría seguir. Luego se encontró con otros arroyos que le susurraron que juntos serían más fuertes. Unidos formaron un río ancho que atravesó bosques, pueblos y cafetales.

En su recorrido dio agua a las plantas, refrescó a los animales y movió las ruedas de un viejo molino. Al fin, una tarde de nubes rojizas, el río vio una inmensa línea azul. Era el mar. Aquella tarde, las aves celebraron con un concierto sobre sus orillas.

Entonces comprendió que la paciencia y la unión transforman el sueño más lejano en realidad. Dicen los abuelos que, desde entonces, cada gota de lluvia que cae en la montaña lleva dentro el mismo sueño y la misma esperanza.`
  },
  {
    id: 'g6-santamaria',
    grade: 6,
    kind: 'Costa Rica',
    title: 'Juan Santamaría',
    text: `Cada once de abril, las escuelas de Costa Rica recuerdan a Juan Santamaría, héroe nacional. En 1856, un grupo invasor dirigido por William Walker amenazaba la libertad de Centroamérica. El ejército costarricense persiguió a los invasores hasta la ciudad de Rivas, en Nicaragua.

Allí, los enemigos se refugiaron en un mesón de madera. Según la historia, Juan Santamaría, un joven tamborilero de Alajuela, se ofreció para prender fuego al edificio. Su valentía fue decisiva para vencer a los invasores, aunque él perdió la vida.

Un año después, los invasores abandonaron la región.

Hoy, en Alajuela, una estatua y un aeropuerto llevan su nombre. Cada año, el once de abril, se celebran desfiles y actos cívicos en su honor.`
  },
  {
    id: 'g6-agua',
    grade: 6,
    kind: 'Costa Rica',
    title: 'El agua, un tesoro',
    text: `Costa Rica tiene muchos ríos y recibe abundantes lluvias, pero el agua no es infinita. Cada gota que bebemos viaja desde las montañas, pasa por los ríos y llega a nuestras casas.

Para cuidarla, podemos cerrar la llave mientras nos cepillamos los dientes, reparar las fugas y no tirar basura en los ríos. También es importante proteger los bosques, porque sus árboles ayudan a que la lluvia llene los mantos acuíferos del suelo.

Los ríos y las nacientes también son hogar de peces, ranas, nutrias y muchas aves. Si el agua se ensucia, todos esos seres sufren. Por eso, cuidar el agua es cuidar la vida.

Si cuidamos el agua hoy, habrá para todos mañana.`
  }
]

/** Cantidad de palabras de un texto (se cuentan las palabras y los números; los signos no cuentan) */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length
}
