import type { Row } from './types'

/**
 * 1.º grado. Escenarios del programa del MEP (Primer ciclo): All about me, This is our classroom, We are all different (familia),
 * Going to school (mi escuela), My neighborhood y Playtime.
 * Fila: [tema, oración, traducción, palabra a completar, distractores…]. Sin «palabra a completar» solo sirve para armar la oración.
 */
export const G1: Row[] = [
  // ───── All about me ─────
  ['All about me', 'Hello, I am Ana.', 'Hola, yo soy Ana.', 'am', 'is', 'are'],
  ['All about me', 'I am happy.', 'Yo estoy feliz.', 'am', 'is', 'are'],
  ['All about me', 'I am seven years old.', 'Tengo siete años.', 'am', 'is', 'are'],
  ['All about me', 'My name is Tom.', 'Mi nombre es Tom.', 'is', 'am', 'are'],
  ['All about me', 'How are you?', '¿Cómo estás?', 'are', 'is', 'am'],
  ['All about me', 'I am fine, thank you.', 'Estoy bien, gracias.', 'am', 'is', 'are'],
  ['All about me', 'Good morning, teacher.', 'Buenos días, maestra.'],
  ['All about me', 'She is sad.', 'Ella está triste.', 'is', 'am', 'are'],
  ['All about me', 'He is my friend.', 'Él es mi amigo.', 'is', 'am', 'are'],
  ['All about me', 'We are happy.', 'Nosotros estamos felices.', 'are', 'is', 'am'],
  ['All about me', 'You are my friend.', 'Tú eres mi amigo.', 'are', 'is', 'am'],
  ['All about me', 'They are friends.', 'Ellos son amigos.', 'are', 'is', 'am'],
  ['All about me', 'I am from Costa Rica.', 'Soy de Costa Rica.', 'am', 'is', 'are'],
  ['All about me', 'Nice to meet you.', 'Mucho gusto.'],
  ['All about me', 'I am a boy.', 'Yo soy un niño.', 'am', 'is', 'are'],
  ['All about me', 'I am tall.', 'Yo soy alto.', 'am', 'is', 'are'],
  ['All about me', 'My hair is black.', 'Mi cabello es negro.', 'is', 'am', 'are'],
  ['All about me', 'My eyes are brown.', 'Mis ojos son cafés.', 'are', 'is', 'am'],
  ['All about me', 'Goodbye, see you later.', 'Adiós, nos vemos luego.'],
  ['All about me', 'I am tired.', 'Estoy cansado.', 'am', 'is', 'are'],

  // ───── Our classroom ─────
  ['Our classroom', 'This is my book.', 'Este es mi libro.', 'is', 'are', 'am'],
  ['Our classroom', 'This is a pencil.', 'Este es un lápiz.', 'is', 'are', 'am'],
  ['Our classroom', 'That is a desk.', 'Eso es un escritorio.', 'is', 'are', 'am'],
  ['Our classroom', 'These are my pencils.', 'Estos son mis lápices.', 'are', 'is', 'am'],
  ['Our classroom', 'Stand up, please.', 'Levántense, por favor.'],
  ['Our classroom', 'Sit down, please.', 'Siéntense, por favor.'],
  ['Our classroom', 'Open your book.', 'Abre tu libro.', 'your', 'you', 'yours'],
  ['Our classroom', 'Close your notebook.', 'Cierra tu cuaderno.', 'your', 'you', 'yours'],
  ['Our classroom', 'Listen and repeat.', 'Escucha y repite.'],
  ['Our classroom', 'Where is my pencil?', '¿Dónde está mi lápiz?', 'is', 'are', 'am'],
  ['Our classroom', 'It is on the desk.', 'Está sobre el escritorio.', 'is', 'are', 'am'],
  [
    'Our classroom',
    'The pencil is under the book.',
    'El lápiz está debajo del libro.',
    'is',
    'are',
    'am'
  ],
  ['Our classroom', 'I have a red pencil.', 'Tengo un lápiz rojo.', 'have', 'has', 'having'],
  ['Our classroom', 'I have two notebooks.', 'Tengo dos cuadernos.', 'have', 'has', 'having'],
  ['Our classroom', 'Is this a book?', '¿Es esto un libro?', 'Is', 'Are', 'Am'],
  ['Our classroom', 'Yes, it is.', 'Sí, lo es.', 'is', 'are', 'am'],
  ['Our classroom', 'This is an eraser.', 'Esto es un borrador.', 'an', 'a', 'two'],
  ['Our classroom', 'The door is brown.', 'La puerta es café.', 'is', 'are', 'am'],
  ['Our classroom', 'The windows are big.', 'Las ventanas son grandes.', 'are', 'is', 'am'],
  ['Our classroom', 'I need a ruler.', 'Necesito una regla.'],
  ['Our classroom', 'Draw a circle.', 'Dibuja un círculo.'],
  ['Our classroom', 'Be quiet, please.', 'Silencio, por favor.'],

  // ───── My family ─────
  ['My family', 'This is my mother.', 'Esta es mi mamá.', 'is', 'are', 'am'],
  ['My family', 'She is my mother.', 'Ella es mi mamá.', 'She', 'He', 'They'],
  ['My family', 'He is my father.', 'Él es mi papá.', 'He', 'She', 'They'],
  ['My family', 'I love my family.', 'Yo amo a mi familia.', 'love', 'loves', 'loving'],
  ['My family', 'My sister is tall.', 'Mi hermana es alta.', 'is', 'are', 'am'],
  ['My family', 'My brother is short.', 'Mi hermano es bajo.', 'is', 'are', 'am'],
  ['My family', 'I have one sister.', 'Tengo una hermana.', 'have', 'has', 'having'],
  ['My family', 'My mother is pretty.', 'Mi mamá es bonita.', 'is', 'are', 'am'],
  ['My family', 'My grandmother is old.', 'Mi abuela es mayor.', 'is', 'are', 'am'],
  ['My family', 'We are a happy family.', 'Somos una familia feliz.', 'are', 'is', 'am'],
  [
    'My family',
    'My father likes to cook.',
    'A mi papá le gusta cocinar.',
    'likes',
    'like',
    'liking'
  ],
  ['My family', 'My mother likes to read.', 'A mi mamá le gusta leer.', 'likes', 'like', 'liking'],
  [
    'My family',
    'I like to play with my brother.',
    'Me gusta jugar con mi hermano.',
    'like',
    'likes',
    'liking'
  ],
  [
    'My family',
    'My sister likes to dance.',
    'A mi hermana le gusta bailar.',
    'likes',
    'like',
    'liking'
  ],
  ['My family', 'They are my parents.', 'Ellos son mis padres.', 'are', 'is', 'am'],
  ['My family', 'My cousin is nice.', 'Mi primo es simpático.', 'is', 'are', 'am'],
  ['My family', 'I do not like soccer.', 'No me gusta el fútbol.', 'do', 'does', 'am'],
  ['My family', 'My brother is little.', 'Mi hermano es pequeño.', 'is', 'are', 'am'],
  [
    'My family',
    'My grandfather watches TV.',
    'Mi abuelo ve televisión.',
    'watches',
    'watch',
    'watching'
  ],
  ['My family', 'My aunt eats an apple.', 'Mi tía come una manzana.', 'eats', 'eat', 'eating'],

  // ───── My school ─────
  ['My school', 'This is my school.', 'Esta es mi escuela.', 'is', 'are', 'am'],
  [
    'My school',
    'The teacher is in the classroom.',
    'La maestra está en el aula.',
    'in',
    'on',
    'under'
  ],
  [
    'My school',
    'The students are in the library.',
    'Los estudiantes están en la biblioteca.',
    'are',
    'is',
    'am'
  ],
  ['My school', 'I go to school.', 'Voy a la escuela.', 'go', 'goes', 'going'],
  ['My school', 'I walk to class.', 'Camino al aula.', 'walk', 'walks', 'walking'],
  ['My school', 'The principal is nice.', 'El director es amable.', 'is', 'are', 'am'],
  [
    'My school',
    'The cook is in the cafeteria.',
    'La cocinera está en el comedor.',
    'is',
    'are',
    'am'
  ],
  ['My school', 'We play in the playground.', 'Jugamos en el patio.', 'play', 'plays', 'playing'],
  [
    'My school',
    'The library is near the gym.',
    'La biblioteca está cerca del gimnasio.',
    'is',
    'are',
    'am'
  ],
  [
    'My school',
    'The computer lab is behind the cafeteria.',
    'El laboratorio de cómputo está detrás del comedor.'
  ],
  [
    'My school',
    'We read books in the library.',
    'Leemos libros en la biblioteca.',
    'read',
    'reads',
    'reading'
  ],
  ['My school', 'I eat lunch at school.', 'Almuerzo en la escuela.', 'eat', 'eats', 'eating'],
  ['My school', 'The teacher says hello.', 'La maestra dice hola.', 'says', 'say', 'saying'],
  [
    'My school',
    'The students line up at the cafeteria.',
    'Los estudiantes hacen fila en el comedor.',
    'line',
    'lines',
    'lining'
  ],
  ['My school', 'I study at school.', 'Estudio en la escuela.', 'study', 'studies', 'studying'],
  [
    'My school',
    'We listen to the teacher.',
    'Escuchamos a la maestra.',
    'listen',
    'listens',
    'listening'
  ],
  [
    'My school',
    'The janitor cleans the school.',
    'El conserje limpia la escuela.',
    'cleans',
    'clean',
    'cleaning'
  ],
  ['My school', 'My school is big.', 'Mi escuela es grande.', 'is', 'are', 'am'],
  [
    'My school',
    'The secretary is in the office.',
    'La secretaria está en la oficina.',
    'is',
    'are',
    'am'
  ],
  [
    'My school',
    'The security guard is at the door.',
    'El guarda de seguridad está en la puerta.',
    'is',
    'are',
    'am'
  ],

  // ───── My neighborhood ─────
  ['My neighborhood', 'This is my neighborhood.', 'Este es mi barrio.', 'is', 'are', 'am'],
  ['My neighborhood', 'The church is near the park.', 'La iglesia está cerca del parque.'],
  [
    'My neighborhood',
    'The supermarket is on the left.',
    'El supermercado está a la izquierda.',
    'is',
    'are',
    'am'
  ],
  ['My neighborhood', 'Go straight.', 'Siga derecho.'],
  ['My neighborhood', 'Turn right at the bank.', 'Gire a la derecha en el banco.'],
  [
    'My neighborhood',
    'The doctor is at the hospital.',
    'El doctor está en el hospital.',
    'is',
    'are',
    'am'
  ],
  ['My neighborhood', 'The firefighter is brave.', 'El bombero es valiente.', 'is', 'are', 'am'],
  ['My neighborhood', 'He is a police officer.', 'Él es oficial de policía.', 'a', 'an', 'two'],
  ['My neighborhood', 'She is a teacher.', 'Ella es maestra.', 'a', 'an', 'two'],
  ['My neighborhood', 'He is an engineer.', 'Él es ingeniero.', 'an', 'a', 'two'],
  ['My neighborhood', 'They are farmers.', 'Ellos son agricultores.', 'are', 'is', 'am'],
  ['My neighborhood', 'The bank is in front of the park.', 'El banco está frente al parque.'],
  ['My neighborhood', 'Please stop.', 'Por favor, deténgase.'],
  ['My neighborhood', 'Thank you very much.', 'Muchas gracias.'],
  ['My neighborhood', 'You are welcome.', 'De nada.', 'are', 'is', 'am'],
  ['My neighborhood', 'Where is the school?', '¿Dónde está la escuela?', 'is', 'are', 'am'],
  ['My neighborhood', 'The hospital is big.', 'El hospital es grande.', 'is', 'are', 'am'],
  [
    'My neighborhood',
    'The restaurant is behind the church.',
    'El restaurante está detrás de la iglesia.'
  ],
  ['My neighborhood', 'She is a nurse.', 'Ella es enfermera.', 'is', 'am', 'are'],
  [
    'My neighborhood',
    'The bus station is near here.',
    'La estación de buses está cerca de aquí.',
    'is',
    'are',
    'am'
  ],

  // ───── Playtime ─────
  ['Playtime', 'I like to play soccer.', 'Me gusta jugar fútbol.', 'like', 'likes', 'liking'],
  [
    'Playtime',
    'He likes to ride a bike.',
    'A él le gusta andar en bicicleta.',
    'likes',
    'like',
    'liking'
  ],
  [
    'Playtime',
    'I need a rope to play.',
    'Necesito una cuerda para jugar.',
    'need',
    'needs',
    'needing'
  ],
  ['Playtime', 'I like to jump rope.', 'Me gusta saltar la cuerda.', 'like', 'likes', 'liking'],
  ['Playtime', 'She plays with dolls.', 'Ella juega con muñecas.', 'plays', 'play', 'playing'],
  ['Playtime', 'We play cards.', 'Jugamos cartas.', 'play', 'plays', 'playing'],
  ['Playtime', 'Can I play?', '¿Puedo jugar?'],
  ['Playtime', 'I can run fast.', 'Puedo correr rápido.', 'can', 'am', 'is'],
  ['Playtime', 'I can jump.', 'Puedo saltar.', 'can', 'am', 'is'],
  ['Playtime', 'I can throw the ball.', 'Puedo lanzar la pelota.', 'can', 'am', 'is'],
  ['Playtime', 'He can kick the ball.', 'Él puede patear la pelota.', 'can', 'are', 'is'],
  ['Playtime', 'This game is fun.', 'Este juego es divertido.', 'is', 'are', 'am'],
  ['Playtime', 'I like video games.', 'Me gustan los videojuegos.', 'like', 'likes', 'liking'],
  [
    'Playtime',
    'I do not like boring games.',
    'No me gustan los juegos aburridos.',
    'do',
    'does',
    'is'
  ],
  [
    'Playtime',
    'My favorite game is hopscotch.',
    'Mi juego favorito es la peregrina.',
    'is',
    'are',
    'am'
  ],
  ['Playtime', 'Show me how to play.', 'Muéstrame cómo jugar.'],
  ['Playtime', 'Ride a bike.', 'Anda en bicicleta.'],
  ['Playtime', 'Throw the ball.', 'Lanza la pelota.'],
  ['Playtime', 'We play on Monday.', 'Jugamos el lunes.', 'play', 'plays', 'playing'],
  ['Playtime', 'It is easy.', 'Es fácil.', 'is', 'are', 'am']
]
