import { definePairLists } from '../define'

/**
 * CIENCIAS - parejas para el juego de memoria.
 * Cada pareja: lo que está en una carta y lo que está en la otra. Los valores de un mismo lado no se repiten.
 */
export default definePairLists('ciencias', [
  {
    title: 'Animales y sus nombres',
    grades: [1, 2, 3],
    topic: 'Animales de Costa Rica',
    pairs: [
      ['🦥', 'Perezoso'],
      ['🐒', 'Mono'],
      ['🦌', 'Venado'],
      ['🐊', 'Cocodrilo'],
      ['🐢', 'Tortuga'],
      ['🐸', 'Rana'],
      ['🦜', 'Loro'],
      ['🦋', 'Mariposa'],
      ['🐍', 'Serpiente'],
      ['🦇', 'Murciélago']
    ]
  },
  {
    title: 'Animal y su grupo',
    grades: [3, 4, 5],
    topic: 'Clasificación de los animales',
    pairs: [
      ['Mono', 'Mamífero'],
      ['Rana', 'Anfibio'],
      ['Iguana', 'Reptil'],
      ['Tucán', 'Ave'],
      ['Mariposa', 'Insecto'],
      ['Atún', 'Pez'],
      ['Araña', 'Arácnido'],
      ['Cangrejo', 'Crustáceo']
    ]
  },
  {
    title: 'Animal y su alimentación',
    grades: [2, 3, 4],
    topic: 'Alimentación de los animales',
    pairs: [
      ['Vaca', 'Pasto'],
      ['Jaguar', 'Carne'],
      ['Oso hormiguero', 'Hormigas'],
      ['Colibrí', 'Néctar'],
      ['Perezoso', 'Hojas'],
      ['Zopilote', 'Animales muertos'],
      ['Tucán', 'Frutas'],
      ['Pelícano', 'Peces'],
      ['Gallina', 'Granos']
    ]
  },
  {
    title: 'Animal y su hábitat',
    grades: [3, 4, 5, 6],
    topic: 'Hábitats y ecosistemas',
    pairs: [
      ['Quetzal', 'Bosque nuboso'],
      ['Garza', 'Humedal'],
      ['Murciélago', 'Cueva'],
      ['Delfín', 'Mar'],
      ['Rana', 'Charca'],
      ['Cocodrilo', 'Río'],
      ['Mono', 'Copa de los árboles'],
      ['Pez payaso', 'Arrecife']
    ]
  },
  {
    title: 'Planetas y sus datos',
    grades: [4, 5, 6],
    topic: 'El Sistema Solar',
    pairs: [
      ['Mercurio', 'El más cercano al Sol'],
      ['Venus', 'El más caliente'],
      ['Tierra', 'Tiene vida'],
      ['Marte', 'Planeta rojo'],
      ['Júpiter', 'El más grande'],
      ['Saturno', 'Anillos muy visibles'],
      ['Urano', 'Gira de lado'],
      ['Neptuno', 'El más lejano del Sol']
    ]
  },
  {
    title: 'Órganos y su función',
    grades: [3, 4, 5],
    topic: 'Cuerpo humano',
    pairs: [
      ['Corazón', 'Bombea la sangre'],
      ['Pulmones', 'Permiten respirar'],
      ['Cerebro', 'Controla el cuerpo'],
      ['Estómago', 'Digiere los alimentos'],
      ['Riñones', 'Filtran la sangre'],
      ['Huesos', 'Sostienen el cuerpo'],
      ['Ojos', 'Permiten ver'],
      ['Músculos', 'Mueven el cuerpo'],
      ['Piel', 'Protege el cuerpo']
    ]
  },
  {
    title: 'Estados y cambios de la materia',
    grades: [2, 3, 4, 5],
    topic: 'La materia',
    pairs: [
      ['Sólido', 'Piedra'],
      ['Líquido', 'Jugo'],
      ['Gaseoso', 'Aire'],
      ['Fusión', 'Hielo que se derrite'],
      ['Evaporación', 'Charco que se seca'],
      ['Condensación', 'Gotas en un vaso frío'],
      ['Solidificación', 'Agua que se vuelve hielo']
    ]
  },
  {
    title: 'Partes de la planta y su función',
    grades: [2, 3, 4],
    topic: 'Las plantas',
    pairs: [
      ['Raíz', 'Absorbe agua'],
      ['Tallo', 'Sostiene la planta'],
      ['Hoja', 'Fabrica el alimento'],
      ['Flor', 'Atrae a los insectos polinizadores'],
      ['Fruto', 'Protege las semillas'],
      ['Semilla', 'Origina una planta nueva']
    ]
  },
  {
    title: 'Hábitos saludables',
    grades: [1, 2, 3],
    topic: 'Hábitos de salud e higiene',
    pairs: [
      ['🪥 Cepillarse los dientes', 'Evitar caries'],
      ['🧼 Lavarse las manos', 'Eliminar microbios'],
      ['😴 Dormir', 'Descansar el cuerpo'],
      ['🥦 Comer verduras', 'Obtener vitaminas'],
      ['💧 Beber agua', 'Hidratar el cuerpo'],
      ['🏃 Hacer ejercicio', 'Fortalecer el cuerpo']
    ]
  },
  {
    title: 'Energía y ejemplos',
    grades: [4, 5, 6],
    topic: 'Energía',
    pairs: [
      ['Solar', 'Paneles en el techo'],
      ['Eólica', 'Aspas que giran con el viento'],
      ['Hidroeléctrica', 'Agua que mueve turbinas'],
      ['Geotérmica', 'Calor del interior de la Tierra'],
      ['Sonora', 'Música de un tambor'],
      ['Luminosa', 'Luz de un bombillo'],
      ['Cinética', 'Bicicleta en movimiento'],
      ['Eléctrica', 'Corriente en un cable']
    ]
  },
  {
    title: 'Costa Rica: símbolos y parques nacionales',
    grades: [3, 4, 5, 6],
    topic: 'Ecosistemas de Costa Rica',
    pairs: [
      ['Yigüirro', 'Ave nacional'],
      ['Guaria morada', 'Flor nacional'],
      ['Guanacaste', 'Árbol nacional'],
      ['Tortuguero', 'Tortugas marinas'],
      ['Cahuita', 'Arrecife de coral'],
      ['Chirripó', 'Montaña más alta'],
      ['Monteverde', 'Bosque nuboso'],
      ['Marino Ballena', 'Ballenas jorobadas'],
      ['Isla del Coco', 'Isla del Pacífico']
    ]
  },
  {
    title: 'Instrumentos y lo que miden',
    grades: [3, 4, 5, 6],
    topic: 'Instrumentos científicos',
    pairs: [
      ['Termómetro', 'Temperatura'],
      ['Balanza', 'Masa'],
      ['Regla', 'Longitud'],
      ['Sismógrafo', 'Sismos'],
      ['Pluviómetro', 'Lluvia'],
      ['Brújula', 'Dirección del norte'],
      ['Telescopio', 'Astros lejanos'],
      ['Microscopio', 'Cosas muy pequeñas'],
      ['Cronómetro', 'Tiempo']
    ]
  },
  {
    title: 'Cuidemos el ambiente',
    grades: [1, 2, 3, 4],
    topic: 'Cuidado del ambiente y reciclaje',
    pairs: [
      ['Reducir', 'Usar menos cosas'],
      ['Reutilizar', 'Dar un nuevo uso'],
      ['Reciclar', 'Hacer productos nuevos con residuos'],
      ['Cerrar la llave', 'Ahorrar agua'],
      ['Apagar la luz', 'Ahorrar energía'],
      ['Sembrar un árbol', 'Cuidar el bosque'],
      ['Hacer abono', 'Aprovechar restos de comida']
    ]
  }
])
