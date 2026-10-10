import type { Grade } from '../../content/types'

/**
 * Frases y preguntas para «Listen and choose». Vocabulario y estructuras de los escenarios del programa de
 * Inglés de I y II ciclos del MEP (2016): ver games/_ingles/vocab.ts y games/_ingles/sentences.
 */

/** Familia de frases parecidas: al jugar, la frase correcta se mezcla con otras de su familia (así hay que escuchar de verdad) */
export interface Family {
  grade: Grade
  topic: string
  /** [inglés, español] */
  phrases: [string, string][]
}

const F = (grade: Grade, topic: string, phrases: [string, string][]): Family => ({
  grade,
  topic,
  phrases
})

export const FAMILIES: Family[] = [
  // ───── 1.º ─────
  F(1, 'Classroom', [
    ['Stand up.', 'Levántate.'],
    ['Sit down.', 'Siéntate.'],
    ['Open your book.', 'Abre tu libro.'],
    ['Close your book.', 'Cierra tu libro.'],
    ['Be quiet.', 'Silencio.'],
    ['Listen and repeat.', 'Escucha y repite.']
  ]),
  F(1, 'Feelings', [
    ['I am happy.', 'Estoy feliz.'],
    ['I am sad.', 'Estoy triste.'],
    ['I am tired.', 'Estoy cansado.'],
    ['I am angry.', 'Estoy enojado.'],
    ['I am sick.', 'Estoy enfermo.'],
    ['I am scared.', 'Tengo miedo.']
  ]),
  F(1, 'Animals', [
    ['It is a dog.', 'Es un perro.'],
    ['It is a cat.', 'Es un gato.'],
    ['It is a bird.', 'Es un pájaro.'],
    ['It is a fish.', 'Es un pez.'],
    ['It is a cow.', 'Es una vaca.'],
    ['It is a horse.', 'Es un caballo.']
  ]),
  F(1, 'Colors', [
    ['I like red.', 'Me gusta el rojo.'],
    ['I like blue.', 'Me gusta el azul.'],
    ['I like green.', 'Me gusta el verde.'],
    ['I like yellow.', 'Me gusta el amarillo.'],
    ['I like pink.', 'Me gusta el rosado.'],
    ['I like purple.', 'Me gusta el morado.']
  ]),
  F(1, 'School supplies', [
    ['I have a pencil.', 'Tengo un lápiz.'],
    ['I have a pen.', 'Tengo un lapicero.'],
    ['I have a ruler.', 'Tengo una regla.'],
    ['I have a notebook.', 'Tengo un cuaderno.'],
    ['I have a book.', 'Tengo un libro.'],
    ['I have an eraser.', 'Tengo un borrador.']
  ]),
  F(1, 'Family', [
    ['This is my mother.', 'Esta es mi mamá.'],
    ['This is my father.', 'Este es mi papá.'],
    ['This is my sister.', 'Esta es mi hermana.'],
    ['This is my brother.', 'Este es mi hermano.'],
    ['This is my grandmother.', 'Esta es mi abuela.'],
    ['This is my grandfather.', 'Este es mi abuelo.']
  ]),
  F(1, 'Greetings', [
    ['Good morning.', 'Buenos días.'],
    ['Good afternoon.', 'Buenas tardes.'],
    ['Good night.', 'Buenas noches.'],
    ['Goodbye.', 'Adiós.'],
    ['Hello.', 'Hola.'],
    ['Thank you.', 'Gracias.']
  ]),
  F(1, 'My body', [
    ['Touch your nose.', 'Toca tu nariz.'],
    ['Touch your head.', 'Toca tu cabeza.'],
    ['Touch your ears.', 'Toca tus orejas.'],
    ['Touch your eyes.', 'Toca tus ojos.'],
    ['Touch your mouth.', 'Toca tu boca.'],
    ['Touch your feet.', 'Toca tus pies.']
  ]),
  F(1, 'Numbers', [
    ['I see two cats.', 'Veo dos gatos.'],
    ['I see three cats.', 'Veo tres gatos.'],
    ['I see four cats.', 'Veo cuatro gatos.'],
    ['I see five cats.', 'Veo cinco gatos.'],
    ['I see six cats.', 'Veo seis gatos.'],
    ['I see ten cats.', 'Veo diez gatos.']
  ]),
  F(1, 'Where is it?', [
    ['It is on the desk.', 'Está sobre el escritorio.'],
    ['It is under the desk.', 'Está debajo del escritorio.'],
    ['It is in the bag.', 'Está en el bolso.'],
    ['It is on the chair.', 'Está sobre la silla.'],
    ['It is under the book.', 'Está debajo del libro.'],
    ['It is in the box.', 'Está en la caja.']
  ]),
  F(1, 'I can', [
    ['I can run.', 'Puedo correr.'],
    ['I can jump.', 'Puedo saltar.'],
    ['I can swim.', 'Puedo nadar.'],
    ['I can sing.', 'Puedo cantar.'],
    ['I can dance.', 'Puedo bailar.'],
    ['I can read.', 'Puedo leer.']
  ]),
  F(1, 'Our school', [
    ['This is the library.', 'Esta es la biblioteca.'],
    ['This is the gym.', 'Este es el gimnasio.'],
    ['This is the cafeteria.', 'Este es el comedor.'],
    ['This is the playground.', 'Este es el patio.'],
    ['This is the classroom.', 'Este es el salón de clases.'],
    ['This is the principal’s office.', 'Esta es la dirección.']
  ]),
  F(1, 'Jobs', [
    ['I am a teacher.', 'Soy maestro.'],
    ['I am a doctor.', 'Soy doctor.'],
    ['I am a nurse.', 'Soy enfermera.'],
    ['I am a farmer.', 'Soy agricultor.'],
    ['I am a cook.', 'Soy cocinero.'],
    ['I am a police officer.', 'Soy oficial de policía.']
  ]),
  F(1, 'Playtime', [
    ['I like to play soccer.', 'Me gusta jugar fútbol.'],
    ['I like to ride a bike.', 'Me gusta andar en bicicleta.'],
    ['I like to jump rope.', 'Me gusta saltar la cuerda.'],
    ['I like to play cards.', 'Me gusta jugar cartas.'],
    ['I like video games.', 'Me gustan los videojuegos.'],
    ['I like to throw the ball.', 'Me gusta lanzar la pelota.']
  ]),

  // ───── 2.º ─────
  F(2, 'Healthy habits', [
    ['I wash my hands.', 'Me lavo las manos.'],
    ['I brush my teeth.', 'Me cepillo los dientes.'],
    ['I take a shower.', 'Me baño.'],
    ['I drink water.', 'Tomo agua.'],
    ['I eat fruit.', 'Como fruta.'],
    ['I sleep well.', 'Duermo bien.']
  ]),
  F(2, 'Home', [
    ['There is a sofa.', 'Hay un sofá.'],
    ['There is a bed.', 'Hay una cama.'],
    ['There is a lamp.', 'Hay una lámpara.'],
    ['There is a mirror.', 'Hay un espejo.'],
    ['There is a table.', 'Hay una mesa.'],
    ['There is a refrigerator.', 'Hay una refrigeradora.']
  ]),
  F(2, 'Animal sounds', [
    ['Dogs bark.', 'Los perros ladran.'],
    ['Cats meow.', 'Los gatos maúllan.'],
    ['Cows say moo.', 'Las vacas hacen muu.'],
    ['Pigs say oink.', 'Los cerdos hacen oink.'],
    ['Birds sing.', 'Los pájaros cantan.'],
    ['Roosters crow.', 'Los gallos cantan.']
  ]),
  F(2, 'Weather', [
    ['It is sunny.', 'Está soleado.'],
    ['It is rainy.', 'Está lluvioso.'],
    ['It is windy.', 'Hace viento.'],
    ['It is cloudy.', 'Está nublado.'],
    ['It is cold.', 'Hace frío.'],
    ['It is hot.', 'Hace calor.']
  ]),
  F(2, 'Clothes', [
    ['I wear a hat.', 'Uso un sombrero.'],
    ['I wear sandals.', 'Uso sandalias.'],
    ['I wear boots.', 'Uso botas.'],
    ['I wear shorts.', 'Uso pantaloneta.'],
    ['I wear a raincoat.', 'Uso un impermeable.'],
    ['I wear a sweater.', 'Uso un suéter.']
  ]),
  F(2, 'Family', [
    ['This is my grandmother.', 'Esta es mi abuela.'],
    ['This is my uncle.', 'Este es mi tío.'],
    ['This is my aunt.', 'Esta es mi tía.'],
    ['This is my cousin.', 'Este es mi primo.'],
    ['This is my grandfather.', 'Este es mi abuelo.'],
    ['This is my baby sister.', 'Esta es mi hermanita bebé.']
  ]),
  F(2, 'Rooms', [
    ['I cook in the kitchen.', 'Cocino en la cocina.'],
    ['I sleep in the bedroom.', 'Duermo en el cuarto.'],
    ['I take a shower in the bathroom.', 'Me baño en el baño.'],
    ['I eat in the dining room.', 'Como en el comedor.'],
    ['I watch TV in the living room.', 'Veo televisión en la sala.']
  ]),
  F(2, 'Nature walk', [
    ['I see a tree.', 'Veo un árbol.'],
    ['I see a flower.', 'Veo una flor.'],
    ['I see a butterfly.', 'Veo una mariposa.'],
    ['I see a snake.', 'Veo una serpiente.'],
    ['I see a frog.', 'Veo una rana.'],
    ['I see a river.', 'Veo un río.']
  ]),
  F(2, 'Learning is fun', [
    ['I write with a pencil.', 'Escribo con un lápiz.'],
    ['I color with crayons.', 'Coloreo con crayones.'],
    ['I cut with scissors.', 'Corto con tijeras.'],
    ['I measure with a ruler.', 'Mido con una regla.'],
    ['I erase with an eraser.', 'Borro con un borrador.']
  ]),
  F(2, 'Food', [
    ['I like pizza.', 'Me gusta la pizza.'],
    ['I like rice.', 'Me gusta el arroz.'],
    ['I like fruit salad.', 'Me gusta la ensalada de frutas.'],
    ['I do not like pizza.', 'No me gusta la pizza.'],
    ['I do not like rice.', 'No me gusta el arroz.'],
    ['I like fish.', 'Me gusta el pescado.']
  ]),

  // ───── 3.º ─────
  F(3, 'Family chores', [
    ['I wash the dishes.', 'Lavo los platos.'],
    ['I sweep the floor.', 'Barro el piso.'],
    ['I make my bed.', 'Hago mi cama.'],
    ['I take out the trash.', 'Saco la basura.'],
    ['I clean my room.', 'Limpio mi cuarto.'],
    ['I water the plants.', 'Riego las plantas.']
  ]),
  F(3, 'Birthdays', [
    ['My birthday is in May.', 'Mi cumpleaños es en mayo.'],
    ['My birthday is in June.', 'Mi cumpleaños es en junio.'],
    ['My birthday is in March.', 'Mi cumpleaños es en marzo.'],
    ['My birthday is in August.', 'Mi cumpleaños es en agosto.'],
    ['My birthday is in December.', 'Mi cumpleaños es en diciembre.']
  ]),
  F(3, 'Time', [
    ['It is seven o’clock.', 'Son las siete en punto.'],
    ['It is eight o’clock.', 'Son las ocho en punto.'],
    ['It is nine o’clock.', 'Son las nueve en punto.'],
    ['It is ten o’clock.', 'Son las diez en punto.'],
    ['It is twelve o’clock.', 'Son las doce en punto.'],
    ['It is three o’clock.', 'Son las tres en punto.']
  ]),
  F(3, 'Shopping', [
    ['I want a blue shirt.', 'Quiero una camisa azul.'],
    ['I want a red dress.', 'Quiero un vestido rojo.'],
    ['I want a green hat.', 'Quiero un sombrero verde.'],
    ['I want white shoes.', 'Quiero zapatos blancos.'],
    ['I want black pants.', 'Quiero un pantalón negro.']
  ]),
  F(3, 'Prices', [
    ['It is two thousand colones.', 'Cuesta dos mil colones.'],
    ['It is five thousand colones.', 'Cuesta cinco mil colones.'],
    ['It is ten thousand colones.', 'Cuesta diez mil colones.'],
    ['It is one thousand colones.', 'Cuesta mil colones.'],
    ['It is twenty thousand colones.', 'Cuesta veinte mil colones.']
  ]),
  F(3, 'Directions', [
    ['Turn left.', 'Gire a la izquierda.'],
    ['Turn right.', 'Gire a la derecha.'],
    ['Go straight.', 'Siga derecho.'],
    ['Stop here.', 'Pare aquí.'],
    ['Cross the street.', 'Cruce la calle.']
  ]),
  F(3, 'Around town', [
    ['The bank is next to the park.', 'El banco está al lado del parque.'],
    ['The bank is behind the church.', 'El banco está detrás de la iglesia.'],
    ['The bank is in front of the school.', 'El banco está frente a la escuela.'],
    ['The bank is near the hospital.', 'El banco está cerca del hospital.'],
    [
      'The bank is between the store and the library.',
      'El banco está entre la tienda y la biblioteca.'
    ]
  ]),
  F(3, 'Hobbies', [
    ['She likes to paint.', 'A ella le gusta pintar.'],
    ['She likes to read.', 'A ella le gusta leer.'],
    ['She likes to dance.', 'A ella le gusta bailar.'],
    ['She likes to swim.', 'A ella le gusta nadar.'],
    ['She likes to cook.', 'A ella le gusta cocinar.']
  ]),
  F(3, 'Days of the week', [
    ['Today is Monday.', 'Hoy es lunes.'],
    ['Today is Tuesday.', 'Hoy es martes.'],
    ['Today is Wednesday.', 'Hoy es miércoles.'],
    ['Today is Thursday.', 'Hoy es jueves.'],
    ['Today is Friday.', 'Hoy es viernes.'],
    ['Today is Saturday.', 'Hoy es sábado.']
  ]),
  F(3, 'Costa Rica', [
    ['Costa Rica has volcanoes.', 'Costa Rica tiene volcanes.'],
    ['Costa Rica has beaches.', 'Costa Rica tiene playas.'],
    ['Costa Rica has rainforests.', 'Costa Rica tiene bosques lluviosos.'],
    ['Costa Rica has coffee farms.', 'Costa Rica tiene fincas de café.'],
    ['Costa Rica has many birds.', 'Costa Rica tiene muchas aves.']
  ]),

  // ───── 4.º ─────
  F(4, 'Weather wise', [
    ['It is raining.', 'Está lloviendo.'],
    ['It is snowing.', 'Está nevando.'],
    ['The sun is shining.', 'El sol está brillando.'],
    ['The wind is blowing.', 'El viento está soplando.'],
    ['It is foggy.', 'Hay neblina.'],
    ['It is very cold.', 'Hace mucho frío.']
  ]),
  F(4, 'Take care', [
    ['I have a headache.', 'Tengo dolor de cabeza.'],
    ['I have a fever.', 'Tengo fiebre.'],
    ['I have a cold.', 'Tengo un resfriado.'],
    ['I have a stomachache.', 'Tengo dolor de estómago.'],
    ['My ears hurt.', 'Me duelen los oídos.']
  ]),
  F(4, 'Advice', [
    ['You should drink water.', 'Deberías tomar agua.'],
    ['You should rest.', 'Deberías descansar.'],
    ['You should see a doctor.', 'Deberías ir al doctor.'],
    ['You should eat vegetables.', 'Deberías comer verduras.'],
    ['You should wash your hands.', 'Deberías lavarte las manos.']
  ]),
  F(4, 'What a disaster!', [
    ['There is an earthquake.', 'Hay un terremoto.'],
    ['There is a flood.', 'Hay una inundación.'],
    ['There is a storm.', 'Hay una tormenta.'],
    ['The volcano is erupting.', 'El volcán está haciendo erupción.'],
    ['There is a fire.', 'Hay un incendio.']
  ]),
  F(4, 'Travel plans', [
    ['I am going to the beach.', 'Voy a la playa.'],
    ['I am going to the mountains.', 'Voy a las montañas.'],
    ['I am going to the city.', 'Voy a la ciudad.'],
    ['I am going to the airport.', 'Voy al aeropuerto.'],
    ['I am going to the hotel.', 'Voy al hotel.']
  ]),
  F(4, 'Farm to table', [
    ['Cows give milk.', 'Las vacas dan leche.'],
    ['Hens give eggs.', 'Las gallinas dan huevos.'],
    ['Farmers grow corn.', 'Los agricultores cultivan maíz.'],
    ['Bees make honey.', 'Las abejas hacen miel.'],
    ['Farmers grow coffee.', 'Los agricultores cultivan café.']
  ]),
  F(4, 'Comparing', [
    ['A turtle is slower than a rabbit.', 'Una tortuga es más lenta que un conejo.'],
    ['A rabbit is faster than a turtle.', 'Un conejo es más rápido que una tortuga.'],
    ['An elephant is bigger than a dog.', 'Un elefante es más grande que un perro.'],
    ['A dog is smaller than an elephant.', 'Un perro es más pequeño que un elefante.'],
    ['Summer is hotter than winter.', 'El verano es más caluroso que el invierno.']
  ]),
  F(4, 'Natural treasures', [
    ['Monkeys are climbing the trees.', 'Los monos están trepando a los árboles.'],
    ['Birds are flying in the sky.', 'Las aves están volando en el cielo.'],
    ['Turtles are swimming in the sea.', 'Las tortugas están nadando en el mar.'],
    ['Frogs are jumping near the river.', 'Las ranas están saltando cerca del río.'],
    ['The sloth is sleeping.', 'El perezoso está durmiendo.']
  ]),

  // ───── 5.º ─────
  F(5, 'Past', [
    ['I played soccer yesterday.', 'Ayer jugué fútbol.'],
    ['I watched TV yesterday.', 'Ayer vi televisión.'],
    ['I visited my grandmother yesterday.', 'Ayer visité a mi abuela.'],
    ['I cooked dinner yesterday.', 'Ayer cociné la cena.'],
    ['I cleaned my room yesterday.', 'Ayer limpié mi cuarto.']
  ]),
  F(5, 'Tell me a story', [
    ['I went to the beach.', 'Fui a la playa.'],
    ['I ate a sandwich.', 'Comí un sándwich.'],
    ['I saw a rainbow.', 'Vi un arcoíris.'],
    ['I took a photo.', 'Tomé una foto.'],
    ['I had a dog.', 'Tuve un perro.']
  ]),
  F(5, 'Technology', [
    ['I send e-mails.', 'Envío correos electrónicos.'],
    ['I chat with my friends.', 'Chateo con mis amigos.'],
    ['I surf the Internet.', 'Navego por Internet.'],
    ['I charge my phone.', 'Cargo mi teléfono.'],
    ['I play video games.', 'Juego videojuegos.']
  ]),
  F(5, 'Go green', [
    ['We recycle paper.', 'Reciclamos papel.'],
    ['We save water.', 'Ahorramos agua.'],
    ['We plant trees.', 'Sembramos árboles.'],
    ['We reuse bottles.', 'Reutilizamos botellas.'],
    ['We turn off the lights.', 'Apagamos las luces.']
  ]),
  F(5, 'Healthy choices', [
    ['I exercise every day.', 'Hago ejercicio todos los días.'],
    ['I eat vegetables every day.', 'Como verduras todos los días.'],
    ['I drink eight glasses of water.', 'Tomo ocho vasos de agua.'],
    ['I sleep nine hours.', 'Duermo nueve horas.'],
    ['I walk to school every day.', 'Camino a la escuela todos los días.']
  ]),
  F(5, 'How often?', [
    ['I always brush my teeth.', 'Siempre me cepillo los dientes.'],
    ['I sometimes eat candy.', 'A veces como dulces.'],
    ['I never eat junk food.', 'Nunca como comida chatarra.'],
    ['I usually walk to school.', 'Normalmente camino a la escuela.'],
    ['I often play soccer.', 'A menudo juego fútbol.']
  ]),
  F(5, 'Pura vida', [
    ['We say pura vida.', 'Decimos pura vida.'],
    ['We eat gallo pinto.', 'Comemos gallo pinto.'],
    ['We drink coffee.', 'Tomamos café.'],
    ['We celebrate Independence Day.', 'Celebramos el Día de la Independencia.'],
    ['We speak Spanish.', 'Hablamos español.']
  ]),
  F(5, 'Weekends', [
    ['I ride my bike on weekends.', 'Ando en bicicleta los fines de semana.'],
    ['I visit my friends on weekends.', 'Visito a mis amigos los fines de semana.'],
    ['I play chess on weekends.', 'Juego ajedrez los fines de semana.'],
    ['I read books on weekends.', 'Leo libros los fines de semana.'],
    ['I help my family on weekends.', 'Ayudo a mi familia los fines de semana.']
  ]),

  // ───── 6.º ─────
  F(6, 'Heroes', [
    ['He was a brave soldier.', 'Él fue un soldado valiente.'],
    ['She was a brave nurse.', 'Ella fue una enfermera valiente.'],
    ['He was a great teacher.', 'Él fue un gran maestro.'],
    ['She was a famous writer.', 'Ella fue una escritora famosa.'],
    ['He was a kind doctor.', 'Él fue un doctor amable.']
  ]),
  F(6, 'Digital safety', [
    ['Never share your password.', 'Nunca comparta su contraseña.'],
    ['Do not click on strange links.', 'No haga clic en enlaces extraños.'],
    ['Be kind online.', 'Sea amable en línea.'],
    ['Tell an adult.', 'Dígaselo a un adulto.'],
    ['Think before you post.', 'Piense antes de publicar.'],
    ['Keep your information private.', 'Mantenga privada su información.']
  ]),
  F(6, 'Environment', [
    ['Put paper in the blue bin.', 'Ponga el papel en el contenedor azul.'],
    ['Put bottles in the recycling bin.', 'Ponga las botellas en el contenedor de reciclaje.'],
    ['Do not throw trash on the ground.', 'No tire basura al suelo.'],
    ['Turn off the lights.', 'Apague las luces.'],
    ['Plant a tree.', 'Siembre un árbol.']
  ]),
  F(6, 'Rainforest rescue', [
    ['The jaguar is endangered.', 'El jaguar está en peligro de extinción.'],
    ['The rainforest is hot and humid.', 'El bosque lluvioso es cálido y húmedo.'],
    ['Sloths move slowly.', 'Los perezosos se mueven despacio.'],
    ['The macaw is a colorful bird.', 'La lapa es un ave colorida.'],
    ['Rangers protect the forest.', 'Los guardaparques protegen el bosque.'],
    ['The frog is very small.', 'La rana es muy pequeña.']
  ]),
  F(6, 'Party time', [
    ['The party starts at three.', 'La fiesta empieza a las tres.'],
    ['The party starts at four.', 'La fiesta empieza a las cuatro.'],
    ['The party starts at five.', 'La fiesta empieza a las cinco.'],
    ['The party starts at six.', 'La fiesta empieza a las seis.'],
    ['The party starts at noon.', 'La fiesta empieza al mediodía.']
  ]),
  F(6, 'The future', [
    ['I will be a doctor.', 'Seré doctor.'],
    ['I will be a teacher.', 'Seré maestro.'],
    ['I will be a pilot.', 'Seré piloto.'],
    ['I will be a scientist.', 'Seré científico.'],
    ['I will be an engineer.', 'Seré ingeniero.']
  ]),
  F(6, 'Tomorrow', [
    ['Tomorrow I will study.', 'Mañana estudiaré.'],
    ['Tomorrow I will travel.', 'Mañana viajaré.'],
    ['Tomorrow I will help my mother.', 'Mañana ayudaré a mi mamá.'],
    ['Tomorrow I will visit my friends.', 'Mañana visitaré a mis amigos.'],
    ['Tomorrow I will play soccer.', 'Mañana jugaré fútbol.']
  ]),
  F(6, 'Party time', [
    ['We celebrated her birthday.', 'Celebramos su cumpleaños.'],
    ['We ate pizza and cake.', 'Comimos pizza y pastel.'],
    ['We danced all night.', 'Bailamos toda la noche.'],
    ['We sang the birthday song.', 'Cantamos la canción de cumpleaños.'],
    ['We opened the gifts.', 'Abrimos los regalos.']
  ])
]

/**
 * Pregunta y respuesta: [grado, tipo, pregunta, respuesta, traducción]. Los distractores son respuestas de OTROS tipos del mismo grado
 * (por eso los tipos no se mezclan: «name», «age», «place»…), así solo una respuesta tiene sentido.
 */
export type QA = [grade: Grade, type: string, question: string, answer: string, es: string]

export const QUESTIONS: QA[] = [
  // ───── 1.º ─────
  [1, 'name', 'What is your name?', 'My name is Ana.', '¿Cómo te llamas? Me llamo Ana.'],
  [1, 'name', 'What is her name?', 'Her name is Mia.', '¿Cómo se llama ella? Se llama Mia.'],
  [1, 'feeling', 'How are you?', 'I am fine, thank you.', '¿Cómo estás? Estoy bien, gracias.'],
  [1, 'feeling', 'How are you today?', 'I am happy.', '¿Cómo estás hoy? Estoy feliz.'],
  [
    1,
    'age',
    'How old are you?',
    'I am seven years old.',
    '¿Cuántos años tienes? Tengo siete años.'
  ],
  [
    1,
    'age',
    'How old is your sister?',
    'She is five years old.',
    '¿Cuántos años tiene tu hermana? Tiene cinco años.'
  ],
  [1, 'thing', 'What is this?', 'It is a pencil.', '¿Qué es esto? Es un lápiz.'],
  [1, 'thing', 'What is that?', 'It is a book.', '¿Qué es eso? Es un libro.'],
  [1, 'color', 'What color is it?', 'It is red.', '¿De qué color es? Es rojo.'],
  [1, 'color', 'What color is the sky?', 'It is blue.', '¿De qué color es el cielo? Es azul.'],
  [
    1,
    'place',
    'Where is my pencil?',
    'It is on the desk.',
    '¿Dónde está mi lápiz? Está sobre el escritorio.'
  ],
  [
    1,
    'place',
    'Where is the book?',
    'It is under the chair.',
    '¿Dónde está el libro? Está debajo de la silla.'
  ],
  [1, 'who', 'Who is she?', 'She is my mother.', '¿Quién es ella? Es mi mamá.'],
  [1, 'who', 'Who is he?', 'He is my father.', '¿Quién es él? Es mi papá.'],
  [1, 'from', 'Where are you from?', 'I am from Costa Rica.', '¿De dónde eres? Soy de Costa Rica.'],
  [1, 'like', 'What do you like?', 'I like pizza.', '¿Qué te gusta? Me gusta la pizza.'],
  [1, 'can', 'What can you do?', 'I can run.', '¿Qué puedes hacer? Puedo correr.'],
  [1, 'day', 'What day is it?', 'It is Monday.', '¿Qué día es hoy? Es lunes.'],
  [
    1,
    'number',
    'How many pencils do you have?',
    'I have five pencils.',
    '¿Cuántos lápices tienes? Tengo cinco lápices.'
  ],
  [
    1,
    'where2',
    'Where is the school?',
    'It is near the park.',
    '¿Dónde está la escuela? Está cerca del parque.'
  ],

  // ───── 2.º ─────
  [2, 'live', 'Where do you live?', 'I live in San José.', '¿Dónde vives? Vivo en San José.'],
  [
    2,
    'food',
    'What is your favorite food?',
    'My favorite food is rice and beans.',
    '¿Cuál es tu comida favorita? Mi comida favorita es el arroz con frijoles.'
  ],
  [2, 'weather', 'How is the weather?', 'It is sunny.', '¿Cómo está el clima? Está soleado.'],
  [
    2,
    'weather',
    'How is the weather today?',
    'It is rainy and cold.',
    '¿Cómo está el clima hoy? Está lluvioso y frío.'
  ],
  [
    2,
    'wear',
    'What do you wear when it is rainy?',
    'I wear a raincoat.',
    '¿Qué usas cuando llueve? Uso un impermeable.'
  ],
  [
    2,
    'wear',
    'What do you wear at the beach?',
    'I wear sandals.',
    '¿Qué usas en la playa? Uso sandalias.'
  ],
  [
    2,
    'routine',
    'What do you do after lunch?',
    'I brush my teeth.',
    '¿Qué haces después del almuerzo? Me cepillo los dientes.'
  ],
  [
    2,
    'routine',
    'What do you do before lunch?',
    'I wash my hands.',
    '¿Qué haces antes del almuerzo? Me lavo las manos.'
  ],
  [2, 'pet', 'What pet do you have?', 'I have a dog.', '¿Qué mascota tienes? Tengo un perro.'],
  [2, 'sound', 'What does a cow say?', 'It says moo.', '¿Qué dice la vaca? Dice muu.'],
  [2, 'sound', 'What does a cat say?', 'It says meow.', '¿Qué dice el gato? Dice miau.'],
  [
    2,
    'room',
    'Where do you sleep?',
    'I sleep in my bedroom.',
    '¿Dónde duermes? Duermo en mi cuarto.'
  ],
  [
    2,
    'room',
    'Where do you cook?',
    'I cook in the kitchen.',
    '¿Dónde cocinas? Cocino en la cocina.'
  ],
  [2, 'name', 'What is your name?', 'My name is Tom.', '¿Cómo te llamas? Me llamo Tom.'],
  [
    2,
    'how',
    'How are you today?',
    'I am great, thanks.',
    '¿Cómo estás hoy? Estoy muy bien, gracias.'
  ],
  [
    2,
    'school',
    'What do you use to write?',
    'I use a pencil.',
    '¿Qué usas para escribir? Uso un lápiz.'
  ],

  // ───── 3.º ─────
  [3, 'time', 'What time is it?', 'It is seven o’clock.', '¿Qué hora es? Son las siete en punto.'],
  [
    3,
    'time',
    'What time do you go to school?',
    'I go to school at seven.',
    '¿A qué hora vas a la escuela? Voy a las siete.'
  ],
  [
    3,
    'birthday',
    'When is your birthday?',
    'It is in May.',
    '¿Cuándo es tu cumpleaños? Es en mayo.'
  ],
  [
    3,
    'birthday',
    'When is your mother’s birthday?',
    'It is in August.',
    '¿Cuándo es el cumpleaños de tu mamá? Es en agosto.'
  ],
  [
    3,
    'price',
    'How much is this shirt?',
    'It is five thousand colones.',
    '¿Cuánto cuesta esta camisa? Cuesta cinco mil colones.'
  ],
  [
    3,
    'price',
    'How much are these shoes?',
    'They are ten thousand colones.',
    '¿Cuánto cuestan estos zapatos? Cuestan diez mil colones.'
  ],
  [
    3,
    'place',
    'Where is the bank?',
    'It is next to the park.',
    '¿Dónde está el banco? Está al lado del parque.'
  ],
  [
    3,
    'place',
    'Where is the library?',
    'It is behind the church.',
    '¿Dónde está la biblioteca? Está detrás de la iglesia.'
  ],
  [
    3,
    'chore',
    'What does your mother do at home?',
    'She cooks dinner.',
    '¿Qué hace tu mamá en la casa? Cocina la cena.'
  ],
  [
    3,
    'chore',
    'What does your brother do at home?',
    'He sweeps the floor.',
    '¿Qué hace tu hermano en la casa? Barre el piso.'
  ],
  [3, 'go', 'How do you get to school?', 'I walk to school.', '¿Cómo llegas a la escuela? Camino.'],
  [
    3,
    'like',
    'What do you like to do?',
    'I like to play soccer.',
    '¿Qué te gusta hacer? Me gusta jugar fútbol.'
  ],
  [
    3,
    'shop',
    'May I help you?',
    'I want a blue shirt, please.',
    '¿Le puedo ayudar? Quiero una camisa azul, por favor.'
  ],
  [
    3,
    'age',
    'How old is your sister?',
    'She is ten years old.',
    '¿Cuántos años tiene tu hermana? Tiene diez años.'
  ],
  [3, 'day', 'What day is it today?', 'It is Friday.', '¿Qué día es hoy? Es viernes.'],
  [
    3,
    'cr',
    'What can we see in Costa Rica?',
    'We can see volcanoes and beaches.',
    '¿Qué podemos ver en Costa Rica? Volcanes y playas.'
  ],

  // ───── 4.º ─────
  [
    4,
    'weather',
    'What is the weather like today?',
    'It is raining.',
    '¿Cómo está el clima hoy? Está lloviendo.'
  ],
  [
    4,
    'weather',
    'What is the weather like at the beach?',
    'It is hot and sunny.',
    '¿Cómo está el clima en la playa? Hace calor y hay sol.'
  ],
  [
    4,
    'wear',
    'What are you wearing?',
    'I am wearing a jacket.',
    '¿Qué estás usando? Estoy usando una chaqueta.'
  ],
  [
    4,
    'health',
    'What is the matter?',
    'I have a headache.',
    '¿Qué te pasa? Tengo dolor de cabeza.'
  ],
  [4, 'health', 'What is wrong with him?', 'He has a fever.', '¿Qué tiene él? Tiene fiebre.'],
  [
    4,
    'advice',
    'What should I do?',
    'You should drink water.',
    '¿Qué debo hacer? Deberías tomar agua.'
  ],
  [
    4,
    'advice',
    'What should I do if I am sick?',
    'You should see a doctor.',
    '¿Qué debo hacer si estoy enfermo? Deberías ir al doctor.'
  ],
  [4, 'going', 'Where are you going?', 'I am going to the beach.', '¿Adónde vas? Voy a la playa.'],
  [
    4,
    'plan',
    'What are you going to do tomorrow?',
    'I am going to visit my grandmother.',
    '¿Qué vas a hacer mañana? Voy a visitar a mi abuela.'
  ],
  [
    4,
    'farm',
    'What do farmers grow?',
    'They grow vegetables.',
    '¿Qué cultivan los agricultores? Cultivan verduras.'
  ],
  [
    4,
    'farm',
    'Where does milk come from?',
    'It comes from cows.',
    '¿De dónde viene la leche? Viene de las vacas.'
  ],
  [
    4,
    'quake',
    'What do you do in an earthquake?',
    'I get under a table.',
    '¿Qué haces en un terremoto? Me meto debajo de una mesa.'
  ],
  [
    4,
    'park',
    'What animals live in the forest?',
    'Monkeys and birds live there.',
    '¿Qué animales viven en el bosque? Allí viven monos y aves.'
  ],
  [
    4,
    'bigger',
    'Which is bigger, a dog or an elephant?',
    'An elephant is bigger.',
    '¿Cuál es más grande, un perro o un elefante? El elefante.'
  ],

  // ───── 5.º ─────
  [
    5,
    'yesterday',
    'What did you do yesterday?',
    'I played soccer.',
    '¿Qué hiciste ayer? Jugué fútbol.'
  ],
  [
    5,
    'weekend',
    'Where did you go last weekend?',
    'I went to the beach.',
    '¿Adónde fuiste el fin de semana pasado? Fui a la playa.'
  ],
  [
    5,
    'tech',
    'What can you do on the Internet?',
    'I can send e-mails.',
    '¿Qué puedes hacer en Internet? Puedo enviar correos.'
  ],
  [
    5,
    'often',
    'How often do you exercise?',
    'I exercise twice a week.',
    '¿Con qué frecuencia haces ejercicio? Dos veces por semana.'
  ],
  [
    5,
    'green',
    'What should we do to help the environment?',
    'We should recycle.',
    '¿Qué deberíamos hacer para ayudar al ambiente? Reciclar.'
  ],
  [
    5,
    'hobby',
    'What do you like to do on weekends?',
    'I like to ride my bike.',
    '¿Qué te gusta hacer los fines de semana? Andar en bicicleta.'
  ],
  [
    5,
    'sport',
    'What is your favorite sport?',
    'My favorite sport is volleyball.',
    '¿Cuál es tu deporte favorito? El voleibol.'
  ],
  [
    5,
    'was',
    'How was your weekend?',
    'It was great.',
    '¿Cómo estuvo tu fin de semana? Estuvo genial.'
  ],
  [
    5,
    'breakfast',
    'What do you eat for breakfast?',
    'I eat gallo pinto.',
    '¿Qué desayunas? Gallo pinto.'
  ],
  [
    5,
    'ate',
    'What did you eat for lunch?',
    'I ate chicken and rice.',
    '¿Qué almorzaste? Pollo con arroz.'
  ],
  [
    5,
    'story',
    'Who lived in the castle?',
    'The king lived there.',
    '¿Quién vivía en el castillo? El rey.'
  ],
  [
    5,
    'phone',
    'What do you do with your phone?',
    'I call my grandmother.',
    '¿Qué haces con tu teléfono? Llamo a mi abuela.'
  ],

  // ───── 6.º ─────
  [
    6,
    'job',
    'What do you want to be?',
    'I want to be a doctor.',
    '¿Qué quieres ser? Quiero ser doctor.'
  ],
  [
    6,
    'will',
    'What will you do tomorrow?',
    'I will visit my friends.',
    '¿Qué harás mañana? Visitaré a mis amigos.'
  ],
  [
    6,
    'hero',
    'Who was Juan Santamaría?',
    'He was a Costa Rican hero.',
    '¿Quién fue Juan Santamaría? Fue un héroe costarricense.'
  ],
  [
    6,
    'party',
    'What happened at the party?',
    'We ate cake and danced.',
    '¿Qué pasó en la fiesta? Comimos pastel y bailamos.'
  ],
  [
    6,
    'forest',
    'How can we protect the rainforest?',
    'We can plant trees.',
    '¿Cómo podemos proteger el bosque lluvioso? Sembrando árboles.'
  ],
  [
    6,
    'online',
    'What should you do online?',
    'I should never share my password.',
    '¿Qué deberías hacer en línea? Nunca compartir mi contraseña.'
  ],
  [
    6,
    'time',
    'What time does the party start?',
    'It starts at three.',
    '¿A qué hora empieza la fiesta? A las tres.'
  ],
  [
    6,
    'animals',
    'What animals live in the rainforest?',
    'Monkeys and sloths live there.',
    '¿Qué animales viven en el bosque lluvioso? Monos y perezosos.'
  ],
  [
    6,
    'water',
    'How can we save water?',
    'We can take short showers.',
    '¿Cómo podemos ahorrar agua? Tomando duchas cortas.'
  ],
  [
    6,
    'recycle',
    'What can we recycle?',
    'We can recycle paper and glass.',
    '¿Qué podemos reciclar? Papel y vidrio.'
  ],
  [
    6,
    'dream',
    'What is your dream?',
    'My dream is to help animals.',
    '¿Cuál es tu sueño? Mi sueño es ayudar a los animales.'
  ],
  [
    6,
    'past',
    'What did you do last night?',
    'I did my homework.',
    '¿Qué hiciste anoche? Hice mi tarea.'
  ]
]

/**
 * Tipos de pregunta que podrían confundirse entre sí (por ejemplo, «What did you do?» y «What do you like to do?»):
 * una respuesta de un tipo nunca se usa como distractor de otro tipo del mismo grupo.
 */
const GROUPS: Record<string, string[]> = {
  doings: [
    'routine',
    'chore',
    'yesterday',
    'weekend',
    'will',
    'plan',
    'past',
    'party',
    'job',
    'dream',
    'hobby',
    'like',
    'room',
    'school',
    'going',
    'quake',
    'ate',
    'phone'
  ],
  likes: ['like', 'hobby', 'sport', 'food', 'breakfast', 'ate'],
  identity: ['name', 'who'],
  feelings: ['feeling', 'how', 'health'],
  location: ['place', 'where2', 'live', 'room', 'going', 'from', 'plan'],
  timeq: ['time', 'birthday', 'day', 'go'],
  advice: ['advice', 'green', 'online', 'forest', 'water', 'recycle', 'quake'],
  thing: ['thing', 'school', 'pet']
}

/** ¿Pueden confundirse las respuestas de estos dos tipos? */
export function typesConflict(a: string, b: string): boolean {
  if (a === b) return true
  return Object.values(GROUPS).some((g) => g.includes(a) && g.includes(b))
}
