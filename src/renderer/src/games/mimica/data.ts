import type { Level } from '../_adivinar/bands'

/** Una palabra o frase para actuar, dibujar o describir */
export interface Card {
  text: string
  /** 1 sencilla (1.º–2.º), 2 media (3.º–4.º), 3 difícil (5.º–6.º); 0 = sin nivel (mazo propio) */
  level: Level | 0
  /** Palabras que no se pueden decir en el modo «Sin decir la palabra» (además de las de la palabra misma) */
  taboo: string[]
}

export interface Deck {
  id: string
  title: string
  icon: string
  cards: Card[]
}

/**
 * Convierte texto en palabras. Una por línea:  Palabra | nivel (1, 2 o 3) | prohibida, prohibida, prohibida
 * El nivel y las prohibidas son opcionales (si no hay nivel, la palabra sirve para cualquier grado).
 */
export function parseCards(source: string): Card[] {
  const cards: Card[] = []
  for (const raw of source.split('\n')) {
    const parts = raw.split('|').map((p) => p.trim())
    if (!parts[0]) continue
    let level: Level | 0 = 0
    let taboo = ''
    if (parts.length >= 3) {
      level = ([1, 2, 3].includes(Number(parts[1])) ? Number(parts[1]) : 0) as Level | 0
      taboo = parts[2]
    } else if (parts.length === 2) {
      if (/^[123]$/.test(parts[1])) level = Number(parts[1]) as Level
      else taboo = parts[1]
    }
    cards.push({
      text: parts[0],
      level,
      taboo: taboo
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    })
  }
  return cards
}

const STOP = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'con', 'sin', 'una', 'por', 'para'])

/** Palabras prohibidas en el modo «Sin decir la palabra»: las del mazo más cada palabra importante de la frase */
export function tabooOf(card: Card): string[] {
  const own = card.text
    .split(/\s+/)
    .map((w) => w.replace(/[.,;:!?¿¡«»"()]/g, ''))
    .filter((w) => w.length >= 4 && !STOP.has(w.toLowerCase()))
  const words =
    own.length > 0 && card.text.split(/\s+/).length > 1 ? [card.text, ...own] : [card.text]
  const seen = new Set<string>()
  return [...words, ...card.taboo].filter((w) => {
    const k = w.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

const deck = (id: string, title: string, icon: string, source: string): Deck => ({
  id,
  title,
  icon,
  cards: parseCards(source)
})

export const DECKS: Deck[] = [
  deck(
    'animales',
    'Animales de Costa Rica',
    '🦥',
    `
Perezoso | 1 | lento, árbol, colgar
Mono | 1 | banano, árbol, cola
Tucán | 1 | pico, ave, colores
Lapa roja | 1 | guacamaya, ave, loro
Rana | 1 | saltar, agua, croar
Tortuga | 1 | caparazón, lenta, mar
Mariposa | 1 | alas, volar, colores
Vaca | 1 | leche, muuu, finca
Caballo | 1 | montar, galopar, establo
Gallina | 1 | huevo, pollito, cacarear
Delfín | 1 | mar, saltar, mamífero
Serpiente | 1 | víbora, arrastrarse, veneno
Cocodrilo | 1 | río, dientes, reptil
Murciélago | 1 | volar, noche, cueva
Jaguar | 2 | felino, manchas, selva
Mono aullador | 2 | congo, gritar, selva
Mono capuchino | 2 | cara blanca, selva, fruta
Pizote | 2 | cola, nariz, anillos
Oso hormiguero | 2 | hormigas, lengua, nariz
Armadillo | 2 | caparazón, cavar, coraza
Iguana | 2 | reptil, verde, lagarto
Basilisco | 2 | Jesucristo, correr, agua
Tortuga baula | 2 | gigante, playa, huevos
Rana de ojos rojos | 2 | verde, árbol, hoja
Colibrí | 2 | picaflor, néctar, volar
Zopilote | 2 | ave, negro, carroña
Pelícano | 2 | pico, bolsa, pescado
Venado cola blanca | 2 | ciervo, cuernos, bosque
Tepezcuintle | 3 | roedor, manchas, madriguera
Manatí | 3 | vaca marina, agua, Caribe
Quetzal | 3 | cola larga, verde, sagrado
Ocelote | 3 | manigordo, felino, manchas
Tiburón ballena | 3 | pez, manchas, enorme
Zompopa | 3 | hormiga, hojas, hormiguero
Ballena jorobada | 3 | cantar, mar, enorme
Saíno | 3 | cerdo, manada, jabalí
`
  ),
  deck(
    'comidas',
    'Comidas y bebidas típicas',
    '🍛',
    `
Gallo pinto | 1 | arroz, frijoles, desayuno
Arroz | 1 | grano, blanco, cocinar
Frijoles | 1 | negros, grano, sopa
Plátano maduro | 1 | frito, dulce, amarillo
Banano | 1 | fruta, amarillo, mono
Pan | 1 | hornear, panadería, trigo
Huevo | 1 | gallina, freír, cascarón
Café | 1 | taza, grano, caliente
Tortilla | 1 | maíz, redonda, masa
Helado | 1 | frío, cono, sabor
Casado | 2 | almuerzo, plato, arroz
Tamal | 2 | Navidad, hoja, masa
Sopa negra | 2 | frijoles, huevo, caldo
Olla de carne | 2 | sopa, verduras, caldo
Arroz con pollo | 2 | fiesta, amarillo, almuerzo
Patacones | 2 | plátano verde, frito, aplastar
Yuca frita | 2 | raíz, aceite, merienda
Empanada | 2 | masa, relleno, queso
Chicharrones | 2 | cerdo, frito, crujiente
Rosquillas | 2 | maíz, queso, horno
Agua dulce | 2 | tapa de dulce, caña, bebida
Fresco de mora | 2 | bebida, fruta, morada
Arroz con leche | 2 | postre, canela, dulce
Natilla | 2 | crema, tortilla, vaca
Pejibaye | 3 | palmera, mayonesa, fruto
Chorreadas | 3 | maíz tierno, tortilla, natilla
Tres leches | 3 | pastel, postre, cumpleaños
Sopa de mondongo | 3 | res, caldo, verduras
Picadillo | 3 | papa, carne, guiso
Cajeta de coco | 3 | dulce, miel, rallar
Rondón | 3 | Caribe, pescado, sopa
Ceviche | 3 | pescado, limón, crudo
Refresco de chan | 3 | semillas, bebida, limón
`
  ),
  deck(
    'oficios',
    'Oficios y profesiones',
    '👩‍🏫',
    `
Maestra | 1 | escuela, enseñar, pizarra
Médico | 1 | enfermo, hospital, bata
Bombero | 1 | fuego, manguera, camión
Policía | 1 | ley, uniforme, patrulla
Cocinero | 1 | comida, cocina, sartén
Panadero | 1 | pan, horno, harina
Pescador | 1 | pez, red, mar
Agricultor | 1 | cultivar, finca, cosecha
Carpintero | 1 | madera, martillo, clavos
Cartero | 1 | cartas, correo, entregar
Dentista | 1 | dientes, muelas, boca
Veterinario | 1 | animales, mascota, curar
Albañil | 2 | casa, cemento, construir
Electricista | 2 | luz, cables, corriente
Plomero | 2 | tubos, agua, fugas
Mecánico | 2 | carro, motor, taller
Piloto | 2 | avión, volar, cabina
Chofer de autobús | 2 | bus, manejar, pasajeros
Enfermera | 2 | hospital, inyección, doctora
Peluquero | 2 | pelo, tijeras, cortar
Músico | 2 | instrumento, cantar, tocar
Pintor | 2 | pincel, colores, cuadro
Guardaparques | 2 | parque nacional, bosque, cuidar
Salvavidas | 2 | playa, nadar, rescatar
Guía turístico | 2 | turistas, tour, explicar
Cajero | 2 | supermercado, dinero, caja
Juez | 3 | ley, tribunal, sentencia
Ingeniero | 3 | puentes, planos, construir
Arquitecto | 3 | planos, edificios, diseñar
Periodista | 3 | noticias, entrevista, micrófono
Astronauta | 3 | espacio, cohete, Luna
Científico | 3 | laboratorio, experimento, investigar
Biólogo | 3 | seres vivos, estudiar, naturaleza
Recolector de café | 3 | cosecha, granos, finca
Costurera | 3 | aguja, tela, coser
`
  ),
  deck(
    'deportes',
    'Deportes',
    '⚽',
    `
Fútbol | 1 | gol, balón, portero
Baloncesto | 1 | canasta, aro, rebotar
Natación | 1 | piscina, nadar, agua
Ciclismo | 1 | bicicleta, pedalear, carrera
Atletismo | 1 | pista, correr, carrera
Voleibol | 1 | red, saque, remate
Saltar la cuerda | 1 | brincar, niños, patio
Béisbol | 2 | bate, jonrón, pelota
Tenis | 2 | raqueta, red, cancha
Surf | 2 | ola, tabla, playa
Gimnasia | 2 | volteretas, flexible, medalla
Karate | 2 | artes marciales, cinta, patada
Judo | 2 | kimono, lanzar, artes marciales
Taekwondo | 2 | patadas, coreano, cinta
Boxeo | 2 | guantes, ring, golpes
Patinaje | 2 | patines, ruedas, hielo
Tenis de mesa | 2 | ping pong, pelota, raqueta
Ajedrez | 2 | tablero, rey, peón
Pesca | 2 | caña, pez, anzuelo
Remo | 3 | bote, río, mar
Clavados | 3 | piscina, saltar, trampolín
Escalada | 3 | roca, cuerda, trepar
Esgrima | 3 | espada, máscara, duelo
Tiro con arco | 3 | flecha, diana, puntería
Triatlón | 3 | nadar, bicicleta, correr
Levantamiento de pesas | 3 | fuerza, gimnasio, barra
Waterpolo | 3 | piscina, portería, nadar
Rafting | 3 | río, balsa, remos
Equitación | 3 | caballo, montar, salto
Bádminton | 3 | raqueta, volante, red
Patineta | 3 | ruedas, trucos, tabla
`
  ),
  deck(
    'acciones',
    'Acciones y verbos',
    '🏃',
    `
Saltar | 1 | brincar, pies, arriba
Correr | 1 | rápido, piernas, carrera
Dormir | 1 | cama, sueño, noche
Comer | 1 | boca, comida, hambre
Beber agua | 1 | vaso, sed, tomar
Bailar | 1 | música, baile, pasos
Cantar | 1 | canción, voz, micrófono
Llorar | 1 | lágrimas, triste, ojos
Reír | 1 | gracioso, carcajada, risa
Nadar | 1 | agua, piscina, brazos
Leer | 1 | libro, páginas, palabras
Escribir | 1 | lápiz, papel, letras
Estornudar | 1 | nariz, gripe, achís
Bostezar | 1 | sueño, boca, cansado
Lavarse los dientes | 1 | cepillo, pasta, boca
Peinarse | 2 | pelo, cepillo, espejo
Hablar por teléfono | 2 | llamar, celular, oreja
Tomar una foto | 2 | cámara, celular, selfi
Manejar un carro | 2 | volante, conducir, calle
Pescar | 2 | caña, pez, anzuelo
Cocinar | 2 | olla, cocina, comida
Barrer | 2 | escoba, piso, basura
Regar las plantas | 2 | agua, jardín, manguera
Tocar la guitarra | 2 | cuerdas, música, canción
Ordeñar una vaca | 3 | leche, finca, ubre
Remar | 3 | bote, remo, agua
Planchar | 3 | ropa, caliente, arrugas
Escalar una montaña | 3 | subir, cumbre, cuerda
Pelar una naranja | 3 | cáscara, fruta, quitar
Cortar café | 3 | cosecha, granos, finca
Atrapar una mariposa | 3 | red, volar, insecto
Tender la ropa | 3 | cuerda, lavar, secar
Palmear tortillas | 3 | masa, maíz, manos
Caminar de puntillas | 3 | silencio, pies, despacio
Construir un castillo de arena | 3 | playa, balde, mar
`
  ),
  deck(
    'objetos',
    'Objetos del aula y del hogar',
    '🎒',
    `
Lápiz | 1 | escribir, punta, papel
Borrador | 1 | borrar, goma, errores
Cuaderno | 1 | hojas, escribir, escuela
Mochila | 1 | espalda, útiles, cargar
Regla | 1 | medir, línea, centímetros
Tijeras | 1 | cortar, papel, filo
Pizarra | 1 | escribir, tiza, marcador
Silla | 1 | sentarse, patas, mesa
Cama | 1 | dormir, almohada, cobija
Reloj | 1 | hora, manecillas, tiempo
Vaso | 1 | beber, agua, cristal
Plato | 1 | comida, cuchara, mesa
Paraguas | 1 | lluvia, mojarse, abrir
Zapatos | 1 | pies, cordones, calzado
Escoba | 2 | barrer, piso, basura
Sacapuntas | 2 | lápiz, punta, filo
Pegamento | 2 | pegar, goma, papel
Calculadora | 2 | números, sumar, botones
Ventilador | 2 | aire, calor, aspas
Refrigeradora | 2 | frío, comida, cocina
Espejo | 2 | reflejo, cara, vidrio
Cepillo de dientes | 2 | boca, pasta, limpiar
Lámpara | 2 | luz, bombillo, alumbrar
Hamaca | 2 | colgar, descansar, balancearse
Llaves | 2 | puerta, abrir, candado
Televisor | 2 | programas, control, pantalla
Olla | 2 | cocina, sopa, tapa
Microscopio | 3 | ver, lente, pequeño
Compás | 3 | círculo, dibujar, punta
Transportador | 3 | ángulos, grados, medir
Globo terráqueo | 3 | mapa, mundo, planeta
Linterna | 3 | luz, pilas, oscuridad
Candado | 3 | llave, cerrar, seguridad
Plancha | 3 | ropa, caliente, arrugas
`
  ),
  deck(
    'lugares',
    'Lugares de Costa Rica',
    '🌋',
    `
Volcán Arenal | 1 | lava, humo, montaña
Volcán Poás | 1 | cráter, gases, Alajuela
Playa | 1 | arena, olas, sol
Volcán Irazú | 1 | Cartago, cráter, ceniza
Teatro Nacional | 1 | San José, obras, escenario
Basílica de los Ángeles | 1 | Cartago, Negrita, iglesia
Parque La Sabana | 1 | San José, estadio, correr
Monteverde | 2 | bosque nuboso, puentes colgantes, niebla
Manuel Antonio | 1 | playa, parque, monos
Tortuguero | 1 | tortugas, canales, Caribe
Tamarindo | 2 | playa, surf, Guanacaste
Puerto Viejo | 2 | Caribe, Limón, playa
Guanacaste | 2 | sabanero, calor, playas
Limón | 2 | puerto, Caribe, carnaval
Puntarenas | 2 | puerto, Pacífico, ferry
Jacó | 2 | playa, surf, Pacífico
Cartago | 2 | ruinas, Virgen, antigua capital
Isla del Coco | 3 | piratas, tesoro, buceo
Cerro Chirripó | 3 | montaña, la más alta, subir
Corcovado | 3 | Osa, selva, parque
Volcán Rincón de la Vieja | 3 | fumarolas, aguas termales, Guanacaste
Catarata La Paz | 3 | agua, caída, jardín
Cahuita | 3 | parque, Caribe, arrecife
Río Pacuare | 3 | rafting, río, aventura
Lago Arenal | 3 | embalse, agua, volcán
Península de Nicoya | 3 | Guanacaste, golfo, playas
Mercado Central | 3 | puestos, comprar, San José
Museo Nacional | 3 | historia, Bellavista, San José
Cordillera de Talamanca | 3 | montañas, frío, Chirripó
Santa Rosa | 3 | Guanacaste, batalla, parque
`
  ),
  deck(
    'cuentos',
    'Cuentos y leyendas',
    '📖',
    `
Tío Conejo | 1 | astuto, tigre, orejas
Tío Tigre | 1 | grande, rayas, rugir
Tío Coyote | 1 | perro, aullar, cuento
Caperucita Roja | 1 | lobo, abuela, capa
Los tres cerditos | 1 | lobo, casa, soplar
Cenicienta | 1 | zapatilla, baile, príncipe
Pinocho | 1 | nariz, mentira, madera
Blancanieves | 1 | enanitos, manzana, espejo
El Patito Feo | 1 | cisne, pato, lago
La Cucarachita Mandinga | 2 | ratón, boda, cuento
El Gato con Botas | 2 | ogro, marqués, sombrero
La Bella Durmiente | 2 | princesa, castillo, hechizo
Aladino | 2 | lámpara, genio, deseos
Hansel y Gretel | 2 | casa, dulces, bruja
La Sirenita | 2 | cola, mar, voz
El Cadejos | 2 | perro negro, noche, camino
La Llorona | 2 | llanto, río, mujer
El Duende | 2 | pequeño, sombrero, travieso
Tía Panchita | 3 | cuentos, Carmen Lyra, libro
La Segua | 3 | caballo, camino, noche
La Carreta sin Bueyes | 3 | ruido, noche, leyenda
Uvieta | 3 | la muerte, árbol, trampa
Cocorí | 3 | libro, niño, Limón
La Negrita | 3 | piedra, Cartago, Virgen
Alí Babá | 3 | ladrones, cueva, tesoro
Peter Pan | 3 | volar, Nunca Jamás, niño
Pulgarcito | 2 | pequeño, migas, bosque
`
  ),
  deck(
    'emociones',
    'Emociones y sentimientos',
    '😃',
    `
Alegría | 1 | feliz, sonrisa, contento
Tristeza | 1 | llorar, pena, lágrimas
Enojo | 1 | bravo, gritar, rabia
Miedo | 1 | susto, temblar, asustado
Sorpresa | 1 | ojos abiertos, inesperado, gritar
Sueño | 1 | dormir, bostezo, cama
Hambre | 1 | comer, estómago, comida
Vergüenza | 2 | cara roja, esconderse, pena
Cansancio | 2 | agotado, dormir, descansar
Aburrimiento | 2 | bostezar, tedio, nada
Nervios | 2 | temblar, examen, preocupado
Emoción | 2 | saltar, feliz, ansioso
Orgullo | 2 | logro, pecho, satisfecho
Asco | 2 | olor, feo, comida
Celos | 2 | envidia, querer, molestia
Cariño | 2 | abrazo, amor, querer
Soledad | 3 | solo, nadie, compañía
Preocupación | 3 | pensar, problema, angustia
Curiosidad | 3 | preguntar, querer saber, mirar
Gratitud | 3 | gracias, agradecer, regalo
Esperanza | 3 | futuro, confiar, deseo
Timidez | 3 | callado, esconderse, hablar
Valentía | 3 | miedo, atreverse, héroe
Calma | 3 | tranquilo, respirar, paz
Frustración | 3 | no poder, rendirse, rabia
Decepción | 3 | esperaba, triste, fallar
Entusiasmo | 3 | ganas, energía, saltar
Paciencia | 3 | esperar, calma, tiempo
Admiración | 3 | ejemplo, aplaudir, respeto
Ternura | 3 | bebé, abrazo, dulce
Confusión | 3 | no entender, dudas, perdido
Alivio | 3 | suspiro, problema, descansar
`
  ),
  deck(
    'ingles',
    'En inglés',
    '🔤',
    `
dog | 1 | bark, pet, puppy
cat | 1 | meow, pet, kitten
apple | 1 | fruit, red, tree
house | 1 | home, live, roof
school | 1 | teacher, students, learn
book | 1 | read, pages, story
red | 1 | color, fire, apple
blue | 1 | color, sky, sea
happy | 1 | smile, glad, sad
run | 1 | fast, legs, walk
eat | 1 | food, mouth, hungry
sleep | 1 | bed, night, tired
mother | 1 | mom, family, woman
water | 1 | drink, wet, glass
bread | 1 | bakery, eat, butter
teacher | 2 | school, class, students
bicycle | 2 | wheels, pedal, ride
butterfly | 2 | wings, insect, fly
elephant | 2 | trunk, big, gray
breakfast | 2 | morning, meal, eat
birthday | 2 | cake, party, gift
umbrella | 2 | rain, open, wet
swim | 2 | pool, water, fish
sing | 2 | song, voice, music
dance | 2 | music, move, party
monkey | 2 | banana, tree, jungle
turtle | 2 | shell, slow, sea
airplane | 2 | fly, pilot, sky
rainbow | 2 | colors, rain, sky
library | 3 | books, quiet, read
neighbor | 3 | next door, house, near
vegetables | 3 | carrot, healthy, salad
thunderstorm | 3 | lightning, rain, loud
mountain | 3 | high, climb, volcano
island | 3 | water, sea, land
dangerous | 3 | careful, risk, safe
whisper | 3 | quiet, voice, secret
comfortable | 3 | soft, sofa, relax
yesterday | 3 | today, past, day
envelope | 3 | letter, mail, paper
`
  ),
  deck(
    'ciencias',
    'Del programa: Ciencias',
    '🔬',
    `
Sol | 1 | estrella, luz, calor
Luna | 1 | noche, cielo, redonda
Lluvia | 1 | agua, nubes, paraguas
Arcoíris | 1 | colores, lluvia, cielo
Planta | 1 | hojas, raíz, regar
Semilla | 1 | sembrar, fruto, tierra
Imán | 1 | atrae, hierro, polos
Volcán | 1 | lava, erupción, montaña
Temblor | 1 | sismo, tierra, mover
Insecto | 1 | seis patas, antenas, pequeño
Ciclo del agua | 2 | evaporación, lluvia, nubes
Sistema solar | 2 | planetas, Sol, órbita
Gravedad | 2 | caer, fuerza, Tierra
Esqueleto | 2 | huesos, cuerpo, cráneo
Corazón | 2 | latir, sangre, pecho
Pulmones | 2 | respirar, aire, oxígeno
Reciclaje | 2 | basura, reutilizar, plástico
Electricidad | 2 | corriente, luz, cables
Termómetro | 2 | temperatura, fiebre, grados
Brújula | 2 | norte, aguja, dirección
Contaminación | 2 | basura, aire, sucio
Huracán | 2 | viento, tormenta, lluvia
Fotosíntesis | 3 | luz, plantas, oxígeno
Cadena alimenticia | 3 | comer, depredador, presa
Hábitat | 3 | vivir, animales, hogar
Energía solar | 3 | Sol, paneles, electricidad
Metamorfosis | 3 | oruga, mariposa, cambio
Eclipse | 3 | Sol, Luna, sombra
Fases de la Luna | 3 | cuarto, llena, nueva
Estados de la materia | 3 | sólido, líquido, gas
Evaporación | 3 | agua, calor, vapor
Polinización | 3 | abeja, flor, polen
Ecosistema | 3 | seres vivos, ambiente, naturaleza
`
  ),
  deck(
    'sociales',
    'Del programa: Estudios Sociales',
    '🌎',
    `
Bandera | 1 | azul, blanco, rojo
Himno Nacional | 1 | cantar, letra, acto cívico
Mapa | 1 | países, dibujo, ubicar
Familia | 1 | mamá, papá, hogar
Escuela | 1 | estudiar, maestra, clases
Comunidad | 1 | vecinos, barrio, vivir
Votar | 2 | elecciones, papeleta, urna
Presidente | 2 | país, gobernar, elecciones
Juan Santamaría | 2 | héroe, Alajuela, Rivas
Independencia | 2 | libertad, antorcha, setiembre
Antorcha | 2 | fuego, llama, correr
Provincias | 2 | siete, división, mapa
Capital | 2 | San José, ciudad, gobierno
Continente | 2 | tierra, América, océano
Océano | 2 | agua, Pacífico, Atlántico
Puntos cardinales | 2 | norte, sur, brújula
Carreta típica | 2 | bueyes, ruedas, pintada
Abolición del ejército | 3 | paz, soldados, Figueres
Asamblea Legislativa | 3 | leyes, diputados, votar
Democracia | 3 | votar, pueblo, elecciones
Derechos del niño | 3 | proteger, ley, respeto
Pueblos indígenas | 3 | bribri, tradiciones, territorios
Línea del Ecuador | 3 | mapa, hemisferio, centro
Ferrocarril | 3 | tren, rieles, estación
Pancha Carrasco | 3 | heroína, soldados, campaña
Monumento Nacional | 3 | San José, héroes, estatua
Anexión del Partido de Nicoya | 3 | 25 de julio, Guanacaste, 1824
Cantón | 3 | municipalidad, alcalde, distrito
Municipalidad | 3 | alcalde, cantón, servicios
Hemisferios | 3 | norte, sur, planeta
`
  ),
  deck(
    'tradiciones',
    'Fiestas y tradiciones',
    '🎉',
    `
Navidad | 1 | árbol, regalos, diciembre
Año Nuevo | 1 | diciembre, fuegos artificiales, medianoche
Día de la Madre | 1 | 15 de agosto, mamá, regalo
Día del Niño | 1 | 9 de setiembre, juegos, niños
Faroles | 1 | luz, noche, independencia
Piñata | 1 | dulces, cumpleaños, palo
Cumpleaños | 1 | pastel, regalos, velitas
Disfraz | 1 | fiesta, máscara, Halloween
Fuegos artificiales | 1 | cielo, ruido, colores
Tamalada | 2 | tamales, cocinar, familia
Portal de Belén | 2 | nacimiento, pesebre, Navidad
Mascarada | 2 | máscaras, baile, gigantes
Carreta | 2 | bueyes, colores, rueda
Marimba | 2 | madera, teclas, tocar
Desfile del 15 de setiembre | 2 | bandas, escuelas, banderas
Tope de Navidad | 2 | caballos, San José, desfile
Semana Santa | 2 | procesión, Jueves Santo, vacaciones
Turno | 2 | feria, juegos mecánicos, comida
Desfile de boyeros | 3 | carretas, bueyes, Escazú
Cimarrona | 3 | banda, bailar, bombo
Festival de la Luz | 3 | San José, luces, Navidad
Romería | 3 | caminar, Cartago, agosto
Punto guanacasteco | 3 | baile, Guanacaste, parejas
Día de la Virgen de los Ángeles | 3 | 2 de agosto, Cartago, Negrita
`
  ),
  deck(
    'plantas',
    'Frutas y plantas',
    '🌴',
    `
Mango | 1 | fruta, amarillo, árbol
Piña | 1 | fruta, espinas, amarilla
Banano | 1 | mono, amarillo, cáscara
Sandía | 1 | verde, roja, semillas
Naranja | 1 | jugo, cítrico, color
Coco | 1 | agua, playa, palmera
Papaya | 1 | naranja, semillas, fruta
Fresa | 1 | roja, dulce, pequeña
Flor | 1 | pétalos, oler, jardín
Árbol | 1 | tronco, hojas, sombra
Girasol | 1 | amarillo, sol, semillas
Rosa | 1 | espinas, flor, roja
Aguacate | 2 | verde, hueso, guacamole
Mora | 2 | morada, fresco, arbusto
Mamón chino | 2 | rojo, cáscara, pelar
Guayaba | 2 | olor, verde, fruta
Maíz | 2 | elote, mazorca, tortilla
Cacao | 2 | chocolate, semillas, fruto
Caña de azúcar | 2 | dulce, tapa, trapiche
Cactus | 2 | desierto, espinas, agua
Palmera | 2 | coco, playa, alta
Ayote | 2 | calabaza, sopa, semillas
Yuca | 2 | raíz, cocinar, frita
Marañón | 3 | fruta, rojo, semilla
Guaria morada | 3 | flor nacional, orquídea, violeta
Orquídea | 3 | flor, delicada, selva
Árbol de Guanacaste | 3 | árbol nacional, sombra, grande
Ceiba | 3 | árbol, gigante, tronco
Bambú | 3 | tallo, panda, hueco
Helecho | 3 | hojas, sombra, selva
Cafeto | 3 | granos, taza, finca
Chayote | 3 | verde, verdura, sopa
Tiquisque | 3 | raíz, verdura, hojas
`
  ),
  deck(
    'transportes',
    'Transportes y vehículos',
    '🚌',
    `
Bicicleta | 1 | pedales, ruedas, manubrio
Carro | 1 | ruedas, manejar, motor
Bus | 1 | pasajeros, parada, chofer
Avión | 1 | volar, alas, aeropuerto
Barco | 1 | agua, mar, navegar
Tren | 1 | rieles, vagones, estación
Helicóptero | 1 | hélices, volar, aterrizar
Moto | 1 | dos ruedas, casco, motor
Camión | 1 | carga, grande, ruedas
Ambulancia | 1 | hospital, sirena, emergencia
Triciclo | 1 | tres ruedas, niño, pedales
Carro de bomberos | 2 | fuego, sirena, escalera
Taxi | 2 | pasajero, carro, rojo
Lancha | 2 | río, agua, motor
Tractor | 2 | finca, arar, llantas
Patineta | 2 | ruedas, trucos, patinar
Carreta | 2 | bueyes, ruedas, madera
Cohete | 2 | espacio, despegar, fuego
Patines | 2 | ruedas, pies, patinar
Buseta | 2 | pasajeros, pequeño, chofer
Submarino | 3 | bajo el agua, periscopio, mar
Globo aerostático | 3 | aire, canasta, volar
Ferry | 3 | barco, autos, Puntarenas
Teleférico | 3 | cables, montaña, cabina
Kayak | 3 | remo, río, bote
Velero | 3 | vela, viento, mar
Carretilla | 3 | obra, mano, rueda
`
  ),
  deck(
    'musica',
    'Música e instrumentos',
    '🎵',
    `
Guitarra | 1 | cuerdas, tocar, madera
Tambor | 1 | palillos, golpear, ritmo
Flauta | 1 | soplar, agujeros, música
Piano | 1 | teclas, blancas, negras
Maracas | 1 | sacudir, ritmo, semillas
Cantante | 1 | micrófono, canción, escenario
Violín | 2 | cuerdas, arco, orquesta
Trompeta | 2 | soplar, metal, banda
Marimba | 2 | madera, baquetas, teclas
Xilófono | 2 | baquetas, colores, notas
Acordeón | 2 | fuelle, teclas, tocar
Triángulo | 2 | metal, golpear, tres lados
Pandereta | 2 | sonajas, mano, ritmo
Coro | 2 | cantar, voces, grupo
Concierto | 2 | música, público, escenario
Canción de cuna | 2 | bebé, dormir, mamá
Orquesta | 2 | instrumentos, director, sinfónica
Salsa | 2 | baile, ritmo, parejas
Arpa | 3 | cuerdas, ángel, grande
Saxofón | 3 | soplar, jazz, metal
Batería | 3 | tambores, platillos, baquetas
Ukelele | 3 | pequeña, Hawái, cuerdas
Director de orquesta | 3 | batuta, música, dirigir
Cimarrona | 3 | banda, fiestas, bombo
Swing criollo | 3 | baile, parejas, música
Calypso | 3 | Limón, Caribe, ritmo
Ocarina | 3 | barro, soplar, silbato
Trombón | 3 | soplar, vara, metal
`
  )
]
