import { defineQuestions } from '../define'

/**
 * Preguntas de INGLÉS (lengua extranjera) para I y II ciclos, 1.º a 6.º.
 *
 * Fuentes (MEP, Costa Rica):
 * - Programa de Estudio de Inglés, Primer Ciclo (2016, enfoque orientado a la acción, nivel MCER A1.1–A1.2):
 *   https://www.mep.go.cr/sites/default/files/media/ingles1ciclo.pdf
 * - Programa de Estudio de Inglés, Segundo Ciclo (2016, nivel MCER A1–A2):
 *   https://drea.mep.go.cr/sites/default/files/publicaciones-anexos-2022/ingles2ciclo_nuevo.pdf
 *   (cuadros «Scope and Sequence» de cada ciclo: escenarios y temas por grado)
 *
 * Temas por grado (el texto del tema se repite igual siempre; se usa para filtrar):
 * 1.º  Saludos y sentimientos · Colores y formas · Números · El salón y los útiles · La familia ·
 *      Animales · El cuerpo · Comida · Mi escuela y comunidad · Gramática básica
 *      (MEP: All about me, This is our classroom, We are all different, Going to school, My neighborhood, Playtime)
 * 2.º  Saludos y sentimientos · Colores y formas · Números · Hábitos saludables y cuerpo · Comida ·
 *      Mi casa · Animales · Naturaleza y clima · Ropa · Gramática básica
 *      (MEP: Learning is fun, Healthy habits, Home sweet home, Loving and caring animals, Fabulous flora and fauna, A change of scenery)
 * 3.º  La familia y los quehaceres · Fechas y celebraciones · Tiendas y precios · Lugares y direcciones ·
 *      Pasatiempos y tiempo libre · Costa Rica · Gramática básica · La hora y las rutinas
 *      (MEP: Our family «to do» list, Families celebrate together, May I help you?, Getting around town, Fun places and spaces, Welcome to Costa Rica)
 * 4.º  Clima y estaciones · Ropa · Parques nacionales y naturaleza · De la finca a la mesa · Salud ·
 *      Desastres naturales · Viajes y planes · Gramática básica
 *      (MEP: Weather wise, Natural treasures, Farm to table, Take care, What a disaster!, Oh! The places you will go)
 * 5.º  Ambiente · Costa Rica · Tecnología · Vida saludable · Cuentos y pasado · Pasatiempos y fin de semana · Gramática básica
 *      (MEP: Go green, Pura vida in many ways, Connecting electronically, Healthy choices, Tell me a story, Let's play)
 * 6.º  Héroes y personajes · Seguridad digital · Basura y reciclaje · Bosque lluvioso · Fiestas · Futuro y planes · Gramática básica
 *      (MEP: Costa Rican heroes, Staying safe in a digital world, Environmentally speaking, Rainforest rescue, Let's party, Focus on the future)
 *
 * Inglés americano estándar. Las instrucciones van en español en 1.º y 2.º y pasan al inglés de 3.º en adelante.
 */
export default defineQuestions('ingles', [
  // [grado, tema, dificultad (1 fácil, 2 media, 3 difícil), pregunta, CORRECTA, incorrecta, incorrecta, incorrecta, explicación (opcional)]

  // ───────────── 1.º ─────────────
  // Saludos y sentimientos
  [1, 'Saludos y sentimientos', 1, '¿Cómo se dice «hola» en inglés?', 'Hello', 'Goodbye', 'Please', 'Sorry'],
  [1, 'Saludos y sentimientos', 1, '¿Cómo se dice «adiós» en inglés?', 'Goodbye', 'Hello', 'Hi', 'Welcome'],
  [1, 'Saludos y sentimientos', 1, '¿Cómo se dice «gracias» en inglés?', 'Thank you', 'Please', 'Sorry', 'Hello'],
  [1, 'Saludos y sentimientos', 1, '😊 How are you? I am ___.', 'happy', 'sad', 'angry', 'tired'],
  [1, 'Saludos y sentimientos', 1, '😢 How do you feel? I am ___.', 'sad', 'happy', 'hungry', 'big'],
  [1, 'Saludos y sentimientos', 2, 'Complete: ___ name is Ana.', 'My', 'Me', 'I', 'Is'],
  [1, 'Saludos y sentimientos', 2, 'Someone asks: «What is your name?» ¿Qué respondes?', 'My name is Sofía.', 'I am six.', 'I am fine.', 'It is red.'],
  [1, 'Saludos y sentimientos', 2, 'Someone asks: «How old are you?» ¿Qué respondes?', 'I am six.', 'My name is Luis.', 'I am fine.', 'It is blue.'],
  [1, 'Saludos y sentimientos', 2, 'Someone asks: «How are you?» ¿Qué respondes?', 'I am fine, thank you.', 'My name is Pedro.', 'I am seven.', 'It is a dog.'],
  [1, 'Saludos y sentimientos', 2, 'Complete: Nice to ___ you.', 'meet', 'eat', 'run', 'blue'],
  [1, 'Saludos y sentimientos', 3, '¿Cuál oración está bien escrita?', 'I am Maria.', 'I is Maria.', 'Me am Maria.', 'Maria I am.'],

  // Colores y formas
  [1, 'Colores y formas', 1, '🔴 What color is this?', 'red', 'blue', 'green', 'yellow'],
  [1, 'Colores y formas', 1, '🔵 What color is this?', 'blue', 'red', 'green', 'black'],
  [1, 'Colores y formas', 1, '🟢 What color is this?', 'green', 'yellow', 'purple', 'white'],
  [1, 'Colores y formas', 1, '🍌 The banana is ___.', 'yellow', 'blue', 'black', 'purple'],
  [1, 'Colores y formas', 2, '⭐ What shape is this?', 'star', 'heart', 'circle', 'square'],
  [1, 'Colores y formas', 2, '🌱 The grass is ___.', 'green', 'red', 'pink', 'white'],
  [1, 'Colores y formas', 2, '⬛ What shape is this?', 'square', 'circle', 'triangle', 'star'],
  [1, 'Colores y formas', 3, 'Costa Rica’s flag has blue, white and ___.', 'red', 'green', 'yellow', 'black'],

  // Números
  [1, 'Números', 1, '¿Cómo se dice «5» en inglés?', 'five', 'four', 'nine', 'three'],
  [1, 'Números', 1, 'one, two, ___, four', 'three', 'five', 'six', 'ten'],
  [1, 'Números', 2, '🍎🍎🍎 How many apples?', 'three', 'two', 'four', 'five'],
  [1, 'Números', 3, '8️⃣ What number is this?', 'eight', 'six', 'nine', 'ten'],
  [1, 'Números', 3, '🐶🐶🐶🐶🐶🐶 How many dogs?', 'six', 'five', 'seven', 'ten'],
  [1, 'Números', 2, '¿Cuál número es el más grande?', 'ten', 'two', 'seven', 'four'],
  [1, 'Números', 3, 'two + three = ___', 'five', 'four', 'six', 'seven'],

  // El salón y los útiles
  [1, 'El salón y los útiles', 1, '✏️ What is this?', 'pencil', 'book', 'chair', 'bag'],
  [1, 'El salón y los útiles', 1, '📖 What is this?', 'book', 'pencil', 'door', 'table'],
  [1, 'El salón y los útiles', 1, '🎒 What is this?', 'backpack', 'chair', 'ruler', 'desk'],
  [1, 'El salón y los útiles', 1, 'La maestra dice: «Sit down!» ¿Qué haces?', 'Me siento', 'Me paro', 'Salto', 'Duermo'],
  [1, 'El salón y los útiles', 2, 'La maestra dice: «Stand up!» ¿Qué haces?', 'Me pongo de pie', 'Me siento', 'Abro la puerta', 'Escribo'],
  [1, 'El salón y los útiles', 3, '✂️ What is this?', 'scissors', 'pencil', 'ruler', 'book'],
  [1, 'El salón y los útiles', 3, '«Open your book» significa…', 'abre tu libro', 'cierra tu libro', 'toma tu lápiz', 'escucha'],

  // La familia
  [1, 'La familia', 1, '¿Cómo se dice «mamá» en inglés?', 'mom', 'dad', 'sister', 'brother'],
  [1, 'La familia', 1, '¿Cómo se dice «hermano» en inglés?', 'brother', 'sister', 'father', 'baby'],
  [1, 'La familia', 2, '¿Cómo se dice «abuela» en inglés?', 'grandmother', 'sister', 'mother', 'aunt'],
  [1, 'La familia', 2, 'This is my father. He is a ___.', 'man', 'woman', 'girl', 'baby'],

  // Animales
  [1, 'Animales', 1, '🐶 What is this?', 'dog', 'cat', 'bird', 'fish'],
  [1, 'Animales', 1, '🐱 What is this?', 'cat', 'dog', 'cow', 'pig'],
  [1, 'Animales', 2, '🐟 What is this?', 'fish', 'bird', 'frog', 'horse'],
  [1, 'Animales', 1, '¿Qué animal hace «meow»?', 'cat', 'dog', 'cow', 'duck'],
  [1, 'Animales', 2, '¿Qué animal puede volar?', 'bird', 'fish', 'cow', 'pig'],
  [1, 'Animales', 3, '🦋 What is this?', 'butterfly', 'bee', 'bird', 'frog'],

  // El cuerpo
  [1, 'El cuerpo', 1, '👂 What is this?', 'ear', 'eye', 'nose', 'mouth'],
  [1, 'El cuerpo', 1, '👃 What is this?', 'nose', 'ear', 'hand', 'foot'],
  [1, 'El cuerpo', 2, 'I see with my ___.', 'eyes', 'ears', 'hands', 'feet'],
  [1, 'El cuerpo', 2, '✋✋ I have two ___.', 'hands', 'head', 'nose', 'mouth'],

  // Comida
  [1, 'Comida', 1, '🍎 What is this?', 'apple', 'banana', 'bread', 'milk'],
  [1, 'Comida', 2, '🥛 What is this?', 'milk', 'egg', 'cake', 'apple'],
  [1, 'Comida', 2, '¿Cuál es una fruta?', 'banana', 'bread', 'milk', 'cheese'],
  [1, 'Comida', 2, '¿Cuál es una bebida?', 'milk', 'egg', 'bread', 'apple'],

  // Mi escuela y comunidad
  [1, 'Mi escuela y comunidad', 1, '🏫 What is this?', 'school', 'house', 'park', 'store'],
  [1, 'Mi escuela y comunidad', 2, '🏠 What is this?', 'house', 'school', 'church', 'park'],
  [1, 'Mi escuela y comunidad', 2, 'I study at ___.', 'school', 'the beach', 'the store', 'the hospital'],

  // Gramática básica
  [1, 'Gramática básica', 2, 'This is ___ dog.', 'a', 'an', 'two', 'many'],
  [1, 'Gramática básica', 3, 'This is ___ apple.', 'an', 'a', 'many', 'two'],
  [1, 'Gramática básica', 3, 'I ___ soccer. ⚽', 'play', 'eat', 'sleep', 'read'],

  // ───────────── 2.º ─────────────
  // Saludos y sentimientos
  [2, 'Saludos y sentimientos', 1, '😡 How do you feel? I am ___.', 'angry', 'happy', 'sleepy', 'hungry'],
  [2, 'Saludos y sentimientos', 1, '😴 How do you feel? I am ___.', 'sleepy', 'angry', 'hungry', 'happy'],
  [2, 'Saludos y sentimientos', 1, '«Hi! How are you today?» ¿Cuál es una buena respuesta?', 'I am great, thanks!', 'I am seven.', 'It is a pencil.', 'Her name is Ana.'],
  [2, 'Saludos y sentimientos', 2, 'Complete: I ___ happy today.', 'am', 'is', 'are', 'be'],
  [2, 'Saludos y sentimientos', 2, '🎨 What class is this?', 'art', 'music', 'math', 'English'],
  [2, 'Saludos y sentimientos', 2, '🎵 What class is this?', 'music', 'art', 'science', 'math'],
  [2, 'Saludos y sentimientos', 3, '¿Cuál oración está bien escrita?', 'I like English class.', 'I likes English class.', 'I liking English class.', 'Like I English class.'],

  // Colores y formas
  [2, 'Colores y formas', 2, '☀️ The sun is ___.', 'yellow', 'blue', 'green', 'black'],
  [2, 'Colores y formas', 1, '🔺 What shape is this?', 'triangle', 'square', 'circle', 'star'],
  [2, 'Colores y formas', 1, '🍅 The tomato is ___.', 'red', 'blue', 'purple', 'white'],
  [2, 'Colores y formas', 3, '🟣 What color is this?', 'purple', 'brown', 'orange', 'pink'],
  [2, 'Colores y formas', 2, 'Mix blue and yellow. You get ___.', 'green', 'purple', 'orange', 'brown'],
  [2, 'Colores y formas', 3, 'Mix red and yellow. You get ___.', 'orange', 'green', 'purple', 'blue'],

  // Números
  [2, 'Números', 1, 'ten, eleven, twelve, ___', 'thirteen', 'fourteen', 'twenty', 'fifteen'],
  [2, 'Números', 2, '¿Cuál es el número 15?', 'fifteen', 'fifty', 'five', 'fourteen'],
  [2, 'Números', 2, 'ten + ten = ___', 'twenty', 'twelve', 'thirty', 'fifteen'],
  [2, 'Números', 3, 'twenty, thirty, forty, ___', 'fifty', 'sixty', 'fourteen', 'fifteen'],
  [2, 'Números', 3, '¿Cuál es el número 14?', 'fourteen', 'forty', 'four', 'fifty'],

  // Hábitos saludables y cuerpo
  [2, 'Hábitos saludables y cuerpo', 1, '🦷 What is this?', 'tooth', 'ear', 'eye', 'hand'],
  [2, 'Hábitos saludables y cuerpo', 1, 'I wash my ___ before I eat.', 'hands', 'shoes', 'books', 'ears'],
  [2, 'Hábitos saludables y cuerpo', 1, 'Drink ___ every day.', 'water', 'candy', 'paint', 'glue'],
  [2, 'Hábitos saludables y cuerpo', 2, 'I brush my ___ every day.', 'teeth', 'toes', 'knees', 'books'],
  [2, 'Hábitos saludables y cuerpo', 3, '🦶🦶 I have two ___.', 'feet', 'foots', 'feets', 'foot'],
  [2, 'Hábitos saludables y cuerpo', 2, 'Which food is healthy?', 'carrots', 'candy', 'cake', 'chips'],
  [2, 'Hábitos saludables y cuerpo', 3, 'I ___ every morning for exercise.', 'run', 'sleep', 'watch TV', 'sit'],

  // Comida
  [2, 'Comida', 2, '🍞 What is this?', 'bread', 'cheese', 'egg', 'milk'],
  [2, 'Comida', 1, '🍉 What is this?', 'watermelon', 'pineapple', 'strawberry', 'banana'],
  [2, 'Comida', 1, '🥕 What is this?', 'carrot', 'apple', 'egg', 'bread'],
  [2, 'Comida', 2, '«Gallo pinto» is made with rice and ___.', 'beans', 'cheese', 'cake', 'apples'],
  [2, 'Comida', 2, 'I am thirsty. I want ___.', 'water', 'bread', 'rice', 'a banana'],
  [2, 'Comida', 2, '«Yummy!» significa…', '¡Rico!', '¡Feo!', '¡Caliente!', '¡Frío!'],

  // Mi casa
  [2, 'Mi casa', 1, 'You sleep in the ___.', 'bedroom', 'kitchen', 'bathroom', 'garden'],
  [2, 'Mi casa', 1, 'You cook in the ___.', 'kitchen', 'bedroom', 'bathroom', 'garage'],
  [2, 'Mi casa', 2, '🛏️ What is this?', 'bed', 'chair', 'door', 'table'],
  [2, 'Mi casa', 2, 'You take a shower in the ___.', 'bathroom', 'kitchen', 'bedroom', 'living room'],
  [2, 'Mi casa', 2, 'I wash the ___ after lunch.', 'dishes', 'sky', 'bed', 'moon'],
  [2, 'Mi casa', 3, 'I clean the floor with a ___.', 'broom', 'spoon', 'pillow', 'pencil'],

  // Animales
  [2, 'Animales', 1, '🐄 What is this?', 'cow', 'pig', 'horse', 'sheep'],
  [2, 'Animales', 2, '🐷 What is this?', 'pig', 'cow', 'dog', 'duck'],
  [2, 'Animales', 1, '¿Qué animal hace «moo»?', 'cow', 'cat', 'dog', 'bird'],
  [2, 'Animales', 3, 'A baby dog is a ___.', 'puppy', 'kitten', 'chick', 'calf'],
  [2, 'Animales', 3, 'Which animal lives in Costa Rica?', 'sloth', 'penguin', 'polar bear', 'camel'],
  [2, 'Animales', 2, 'Which animal is a pet?', 'dog', 'lion', 'elephant', 'tiger'],

  // Naturaleza y clima
  [2, 'Naturaleza y clima', 1, '🌧️ It is ___.', 'rainy', 'sunny', 'windy', 'snowy'],
  [2, 'Naturaleza y clima', 1, '☀️ It is ___.', 'sunny', 'rainy', 'cloudy', 'snowy'],
  [2, 'Naturaleza y clima', 3, '🌸 What is this?', 'flower', 'tree', 'leaf', 'fruit'],
  [2, 'Naturaleza y clima', 2, 'It is raining. I need an ___. ☔', 'umbrella', 'orange', 'egg', 'ice cream'],

  // Ropa
  [2, 'Ropa', 1, '👕 This is my ___.', 'shirt', 'dress', 'hat', 'sock'],
  [2, 'Ropa', 1, '👟 These are my ___.', 'shoes', 'gloves', 'pants', 'hats'],
  [2, 'Ropa', 2, 'I wear ___ on my feet.', 'socks', 'a hat', 'gloves', 'a shirt'],

  // Gramática básica
  [2, 'Gramática básica', 2, 'I ___ a dog.', 'have', 'has', 'haves', 'having'],
  [2, 'Gramática básica', 2, 'He ___ my brother.', 'is', 'am', 'are', 'be'],
  [2, 'Gramática básica', 2, 'They ___ my friends.', 'are', 'is', 'am', 'be'],
  [2, 'Gramática básica', 2, 'There ___ three books on the desk.', 'are', 'is', 'am', 'be'],
  [2, 'Gramática básica', 2, 'One dog, two ___.', 'dogs', 'dog', 'doges', 'dogies'],
  [2, 'Gramática básica', 3, 'She ___ a red shirt.', 'has', 'have', 'having', 'haves'],
  [2, 'Gramática básica', 3, 'One box, two ___.', 'boxes', 'boxs', 'boxies', 'box'],

  // ───────────── 3.º ─────────────
  // La familia y los quehaceres
  [3, 'La familia y los quehaceres', 1, 'My mother’s sister is my ___.', 'aunt', 'uncle', 'cousin', 'grandmother'],
  [3, 'La familia y los quehaceres', 1, 'Which one is a chore at home?', 'wash the dishes', 'play video games', 'watch TV', 'eat candy'],
  [3, 'La familia y los quehaceres', 2, 'My uncle’s son is my ___.', 'cousin', 'brother', 'nephew', 'father'],
  [3, 'La familia y los quehaceres', 2, '___ you help me clean the kitchen?', 'Can', 'Does', 'Is', 'Are'],
  [3, 'La familia y los quehaceres', 2, 'I ___ the trash every night.', 'take out', 'drink', 'listen', 'wear'],
  [3, 'La familia y los quehaceres', 3, 'I ___ my bed every morning.', 'make', 'do', 'cook', 'wash'],

  // Fechas y celebraciones
  [3, 'Fechas y celebraciones', 1, 'What day comes after Monday?', 'Tuesday', 'Sunday', 'Wednesday', 'Friday'],
  [3, 'Fechas y celebraciones', 1, 'The weekend days are Saturday and ___.', 'Sunday', 'Friday', 'Monday', 'Thursday'],
  [3, 'Fechas y celebraciones', 1, 'Which month comes after January?', 'February', 'December', 'March', 'April'],
  [3, 'Fechas y celebraciones', 1, '🎂 Happy ___!', 'birthday', 'Monday', 'school', 'morning'],
  [3, 'Fechas y celebraciones', 1, 'Christmas is in ___.', 'December', 'March', 'June', 'August'],
  [3, 'Fechas y celebraciones', 2, 'My birthday is ___ May.', 'in', 'on', 'at', 'to'],
  [3, 'Fechas y celebraciones', 2, 'My birthday is ___ May 10th.', 'on', 'in', 'at', 'to'],
  [3, 'Fechas y celebraciones', 2, 'What is the third month of the year?', 'March', 'January', 'February', 'April'],
  [3, 'Fechas y celebraciones', 2, 'Costa Rica’s Independence Day is on September ___.', 'fifteenth', 'first', 'twenty-fifth', 'thirtieth'],
  [3, 'Fechas y celebraciones', 3, 'How do you say 2nd in English?', 'second', 'two', 'twice', 'twelfth'],

  // Tiendas y precios
  [3, 'Tiendas y precios', 1, 'What is the money of Costa Rica?', 'colón', 'peso', 'euro', 'quetzal'],
  [3, 'Tiendas y precios', 1, '«How much does it cost?» significa…', '¿Cuánto cuesta?', '¿Cuántos años tienes?', '¿Dónde está?', '¿Qué hora es?'],
  [3, 'Tiendas y precios', 1, 'Where do you buy bread?', 'at the bakery', 'at the bank', 'at the library', 'at the hospital'],
  [3, 'Tiendas y precios', 1, 'Where do you buy fresh vegetables?', 'at the farmers’ market', 'at the shoe store', 'at the bank', 'at the library'],
  [3, 'Tiendas y precios', 2, '«May I help you?» Choose a good answer.', 'Yes, I want a notebook.', 'No, I am ten.', 'Yes, it is Monday.', 'I am fine, a pencil.'],
  [3, 'Tiendas y precios', 3, 'A cashier is the person who ___.', 'takes your money', 'teaches you', 'cooks lunch', 'drives a bus'],
  [3, 'Tiendas y precios', 2, 'The opposite of «cheap» is ___.', 'expensive', 'small', 'old', 'new'],
  [3, 'Tiendas y precios', 3, 'I need a pair of ___.', 'shoes', 'shoe', 'a shoe', 'shoeing'],

  // Lugares y direcciones
  [3, 'Lugares y direcciones', 2, '🏥 What is this place?', 'hospital', 'bank', 'school', 'church'],
  [3, 'Lugares y direcciones', 1, '«Turn left» significa…', 'gira a la izquierda', 'gira a la derecha', 'sigue derecho', 'detente'],
  [3, 'Lugares y direcciones', 1, '«Go straight» significa…', 'sigue derecho', 'gira a la izquierda', 'gira a la derecha', 'regresa'],
  [3, 'Lugares y direcciones', 2, 'You borrow books at the ___.', 'library', 'bakery', 'bank', 'gym'],
  [3, 'Lugares y direcciones', 2, 'You mail a letter at the ___.', 'post office', 'park', 'church', 'restaurant'],
  [3, 'Lugares y direcciones', 3, 'Excuse me, where is the bank? Choose the best answer.', 'Go straight and turn left.', 'I like the bank.', 'It is Monday.', 'Yes, I do.'],
  [3, 'Lugares y direcciones', 2, 'We keep milk ___ the refrigerator.', 'in', 'on', 'under', 'behind'],
  [3, 'Lugares y direcciones', 3, 'The clock is ___ the wall.', 'on', 'in', 'under', 'between'],
  [3, 'Lugares y direcciones', 3, 'The bank is ___ the park and the school.', 'between', 'under', 'on', 'above'],

  // Pasatiempos y tiempo libre
  [3, 'Pasatiempos y tiempo libre', 1, '🎮 I play video ___.', 'games', 'books', 'shoes', 'cakes'],
  [3, 'Pasatiempos y tiempo libre', 1, 'Do you like swimming? Yes, I ___.', 'do', 'am', 'can', 'is'],
  [3, 'Pasatiempos y tiempo libre', 2, 'It is raining. What can we do inside?', 'play board games', 'fly a kite', 'go to the beach', 'ride a bike'],
  [3, 'Pasatiempos y tiempo libre', 2, 'Which activity is outdoors?', 'fly a kite', 'play cards', 'watch TV', 'read a book'],

  // Costa Rica
  [3, 'Costa Rica', 1, 'The capital of Costa Rica is ___.', 'San José', 'Cartago', 'Limón', 'Heredia'],
  [3, 'Costa Rica', 1, '🦥 What is this animal?', 'sloth', 'monkey', 'cat', 'pig'],
  [3, 'Costa Rica', 1, '¿Cómo se dice «lapa roja» en inglés?', 'scarlet macaw', 'blue whale', 'red fish', 'green frog'],
  [3, 'Costa Rica', 1, 'Which one is typical Costa Rican food?', 'gallo pinto', 'sushi', 'haggis', 'pierogi'],
  [3, 'Costa Rica', 2, 'A «carreta» is a typical Costa Rican ___.', 'oxcart', 'airplane', 'boat', 'train'],
  [3, 'Costa Rica', 2, 'Irazú is a ___.', 'volcano', 'beach', 'river', 'island'],

  // Gramática básica
  [3, 'Gramática básica', 2, 'She ___ to school every day.', 'goes', 'go', 'going', 'gos'],
  [3, 'Gramática básica', 3, 'Does he like pizza? Yes, he ___.', 'does', 'is', 'do', 'has'],
  [3, 'Gramática básica', 3, 'One child, two ___.', 'children', 'childs', 'childes', 'child'],
  [3, 'Gramática básica', 3, 'This is ___ book. (Ana)', 'Ana’s', 'Anas', 'Ana is', 'Ana’s is'],

  // La hora y las rutinas
  [3, 'La hora y las rutinas', 2, '🕒 What time is it?', 'It is three o’clock.', 'It is two o’clock.', 'It is six o’clock.', 'It is nine o’clock.'],
  [3, 'La hora y las rutinas', 1, 'In the morning I ___ up at six.', 'wake', 'sleep', 'play', 'draw'],
  [3, 'La hora y las rutinas', 2, '🕗 What time is it?', 'It is eight o’clock.', 'It is five o’clock.', 'It is ten o’clock.', 'It is eleven o’clock.'],
  [3, 'La hora y las rutinas', 3, 'What time is 7:30?', 'half past seven', 'quarter past seven', 'half past eight', 'seven o’clock'],

  // ───────────── 4.º ─────────────
  // Clima y estaciones
  [4, 'Clima y estaciones', 1, '☁️ What is the weather like?', 'It is cloudy.', 'It is sunny.', 'It is snowy.', 'It is hot.'],
  [4, 'Clima y estaciones', 1, '💨 What is the weather like?', 'It is windy.', 'It is rainy.', 'It is sunny.', 'It is snowy.'],
  [4, 'Clima y estaciones', 1, 'The opposite of «hot» is ___.', 'cold', 'warm', 'sunny', 'dry'],
  [4, 'Clima y estaciones', 1, 'Costa Rica has two seasons: the dry season and the ___ season.', 'rainy', 'snowy', 'spring', 'autumn'],
  [4, 'Clima y estaciones', 2, 'spring, summer, autumn, ___', 'winter', 'rainy', 'sunny', 'weather'],
  [4, 'Clima y estaciones', 2, 'It is cold. I wear a ___.', 'jacket', 'swimsuit', 'sandals', 'T-shirt'],
  [4, 'Clima y estaciones', 3, '«It is raining cats and dogs» means…', 'It is raining a lot.', 'There are animals outside.', 'It is not raining.', 'It is sunny.'],

  // Ropa
  [4, 'Ropa', 1, '👗 What is this?', 'dress', 'shirt', 'skirt', 'sock'],
  [4, 'Ropa', 1, '🧤 What are these?', 'gloves', 'socks', 'shoes', 'pants'],
  [4, 'Ropa', 2, 'Look! She ___ a blue dress now.', 'is wearing', 'wears', 'wear', 'wore'],

  // Parques nacionales y naturaleza
  [4, 'Parques nacionales y naturaleza', 1, 'There ___ a river in the park.', 'is', 'are', 'am', 'be'],
  [4, 'Parques nacionales y naturaleza', 1, 'There ___ many animals in the park.', 'are', 'is', 'am', 'be'],
  [4, 'Parques nacionales y naturaleza', 1, '🦜 What is this?', 'parrot', 'duck', 'owl', 'chicken'],
  [4, 'Parques nacionales y naturaleza', 1, 'Which animal can you see in a Costa Rican national park?', 'toucan', 'penguin', 'zebra', 'kangaroo'],
  [4, 'Parques nacionales y naturaleza', 2, 'In a national park, we ___ feed the animals.', 'shouldn’t', 'should', 'are', 'does'],
  [4, 'Parques nacionales y naturaleza', 2, 'You should put the trash in the ___.', 'bin', 'river', 'tree', 'nest'],
  [4, 'Parques nacionales y naturaleza', 2, '«Wildlife» significa…', 'vida silvestre', 'vida urbana', 'comida', 'parque'],
  [4, 'Parques nacionales y naturaleza', 3, 'Tortuguero is famous for green sea ___.', 'turtles', 'monkeys', 'sloths', 'parrots'],

  // De la finca a la mesa
  [4, 'De la finca a la mesa', 1, 'Cows and pigs live on the ___.', 'farm', 'beach', 'bank', 'school'],
  [4, 'De la finca a la mesa', 1, 'Breakfast, lunch, ___', 'dinner', 'dessert', 'recipe', 'menu'],
  [4, 'De la finca a la mesa', 1, '🌽 What is this?', 'corn', 'potato', 'tomato', 'carrot'],
  [4, 'De la finca a la mesa', 2, 'Hens give us ___.', 'eggs', 'milk', 'rice', 'cheese'],
  [4, 'De la finca a la mesa', 2, 'The waiter asks: «May I have your order?» Choose the best answer.', 'I would like a hamburger, please.', 'I am ten years old.', 'It is rainy.', 'My name is Ana.'],
  [4, 'De la finca a la mesa', 3, 'The cook ___ rice right now.', 'is cooking', 'cooks', 'cooked', 'cook'],
  [4, 'De la finca a la mesa', 3, 'Which one is a dairy product?', 'cheese', 'rice', 'carrot', 'beef'],

  // Salud
  [4, 'Salud', 1, 'You buy medicine at the ___.', 'pharmacy', 'bakery', 'library', 'gym'],
  [4, 'Salud', 1, 'I have a toothache. I should go to the ___.', 'dentist', 'baker', 'farmer', 'teacher'],
  [4, 'Salud', 2, '«Headache» significa…', 'dolor de cabeza', 'dolor de estómago', 'dolor de muela', 'dolor de pie'],
  [4, 'Salud', 2, 'When you are sick, you should ___.', 'rest', 'run', 'swim', 'play soccer'],
  [4, 'Salud', 3, 'Yesterday I ___ to the doctor.', 'went', 'go', 'goed', 'going'],
  [4, 'Salud', 2, 'Yesterday I ___ soccer.', 'played', 'play', 'plays', 'playing'],
  [4, 'Salud', 3, 'I ___ a headache yesterday.', 'had', 'have', 'has', 'haved'],
  [4, 'Salud', 3, 'Last night he ___ dinner at home.', 'ate', 'eated', 'eats', 'eat'],

  // Desastres naturales
  [4, 'Desastres naturales', 1, 'What number do you call in an emergency in Costa Rica?', '911', '123', '411', '100'],
  [4, 'Desastres naturales', 1, '«Earthquake» significa…', 'terremoto', 'inundación', 'huracán', 'incendio'],
  [4, 'Desastres naturales', 2, 'It ___ raining when we got home.', 'was', 'were', 'is', 'am'],
  [4, 'Desastres naturales', 2, 'During an earthquake, you should ___.', 'stay calm', 'shout', 'take the elevator', 'stand near windows'],
  [4, 'Desastres naturales', 2, 'Yesterday there ___ a big storm.', 'was', 'were', 'is', 'are'],
  [4, 'Desastres naturales', 3, 'Prepare an emergency ___ with water and food.', 'kit', 'game', 'toy', 'song'],

  // Viajes y planes
  [4, 'Viajes y planes', 1, '🏖️ Where are they?', 'at the beach', 'at the bank', 'at school', 'at the hospital'],
  [4, 'Viajes y planes', 1, '✈️ What is this?', 'airplane', 'bus', 'boat', 'bicycle'],
  [4, 'Viajes y planes', 2, 'My family is ___ to visit Guanacaste.', 'going', 'go', 'goes', 'went'],
  [4, 'Viajes y planes', 2, 'Which place is good for a vacation?', 'a beach', 'a bank', 'a classroom', 'a hospital'],

  // Gramática básica
  [4, 'Gramática básica', 2, 'An elephant is ___ than a dog.', 'bigger', 'big', 'biggest', 'more big'],
  [4, 'Gramática básica', 2, 'A turtle is ___ than a rabbit.', 'slower', 'slow', 'slowest', 'more slow'],
  [4, 'Gramática básica', 2, 'He ___ TV every night.', 'watches', 'watch', 'watchs', 'watching'],
  [4, 'Gramática básica', 3, 'They ___ soccer now.', 'are playing', 'plays', 'play', 'played'],
  [4, 'Gramática básica', 3, 'The blue whale is the ___ animal in the world.', 'biggest', 'bigger', 'most big', 'big'],

  // ───────────── 5.º ─────────────
  // Ambiente
  [5, 'Ambiente', 1, 'The three Rs are reduce, reuse and ___.', 'recycle', 'repeat', 'return', 'remove'],
  [5, 'Ambiente', 1, 'Which item can we recycle?', 'paper', 'banana peel', 'dirty tissue', 'food waste'],
  [5, 'Ambiente', 1, 'Which action harms the environment?', 'throwing litter in the river', 'planting trees', 'recycling cans', 'saving water'],
  [5, 'Ambiente', 1, 'Which action protects the environment?', 'planting trees', 'burning plastic', 'wasting water', 'cutting trees'],
  [5, 'Ambiente', 2, 'Turn off the lights to save ___.', 'energy', 'plastic', 'paper', 'food'],
  [5, 'Ambiente', 2, 'To «reuse» a bottle means to…', 'use it again', 'throw it away', 'break it', 'buy a new one'],
  [5, 'Ambiente', 2, '«Pollution» significa…', 'contaminación', 'solución', 'energía', 'reciclaje'],
  [5, 'Ambiente', 2, 'Animals lose their homes when we cut down ___.', 'forests', 'cars', 'houses', 'roads'],
  [5, 'Ambiente', 3, 'Choose the correct sentence.', 'We should recycle more.', 'We should to recycle more.', 'We should recycling more.', 'We recycle should more.'],

  // Costa Rica
  [5, 'Costa Rica', 1, 'Which one is a province of Costa Rica?', 'Heredia', 'Panama', 'Lima', 'Managua'],
  [5, 'Costa Rica', 2, 'How many provinces are there in Costa Rica?', 'seven', 'five', 'nine', 'ten'],
  [5, 'Costa Rica', 2, 'Limón is on the ___ coast.', 'Caribbean', 'Pacific', 'western', 'northern'],
  [5, 'Costa Rica', 2, 'Costa Rica has no ___. We have peace.', 'army', 'rivers', 'beaches', 'schools'],
  [5, 'Costa Rica', 3, 'Guanacaste is in the ___ of Costa Rica.', 'northwest', 'southeast', 'south', 'east'],
  [5, 'Costa Rica', 3, 'Cartago was the first ___ of Costa Rica.', 'capital', 'volcano', 'beach', 'president'],
  [5, 'Costa Rica', 3, 'Monteverde is famous for its ___ forest.', 'cloud', 'snow', 'desert', 'ocean'],

  // Tecnología
  [5, 'Tecnología', 1, '📱 What is this?', 'cell phone', 'camera', 'clock', 'radio'],
  [5, 'Tecnología', 1, '⌨️ What is this?', 'keyboard', 'mouse', 'screen', 'printer'],
  [5, 'Tecnología', 1, '🎧 What are these?', 'headphones', 'glasses', 'gloves', 'shoes'],
  [5, 'Tecnología', 1, '«Pantalla» en inglés es…', 'screen', 'password', 'button', 'wire'],
  [5, 'Tecnología', 2, 'My phone is dead. I need to ___ it.', 'charge', 'drink', 'wash', 'cook'],
  [5, 'Tecnología', 2, 'Turn ___ the computer when you finish.', 'off', 'on', 'up', 'for'],
  [5, 'Tecnología', 2, 'A tablet is ___ than a computer.', 'smaller', 'small', 'smallest', 'more small'],
  [5, 'Tecnología', 2, 'Never share your ___ with strangers.', 'password', 'pencil', 'lunch', 'shoes'],
  [5, 'Tecnología', 3, 'A computer is ___ than a tablet for long homework.', 'better', 'good', 'best', 'more good'],
  [5, 'Tecnología', 3, 'To «download» a file means…', 'descargarlo', 'borrarlo', 'imprimirlo', 'abrirlo'],

  // Vida saludable
  [5, 'Vida saludable', 1, 'Which food has a lot of sugar?', 'candy', 'carrots', 'rice', 'water'],
  [5, 'Vida saludable', 1, 'A healthy lifestyle: eat vegetables and ___.', 'exercise', 'watch TV all day', 'eat candy', 'stay up late'],
  [5, 'Vida saludable', 2, 'What did you cook? I ___ rice and beans.', 'cooked', 'cook', 'cooks', 'cooking'],
  [5, 'Vida saludable', 2, 'The opposite of «healthy» is ___.', 'unhealthy', 'happy', 'hungry', 'strong'],
  [5, 'Vida saludable', 2, '«Junk food» significa…', 'comida chatarra', 'comida sana', 'comida casera', 'comida típica'],
  [5, 'Vida saludable', 3, 'Yesterday I ___ a glass of water.', 'drank', 'drinked', 'drink', 'drinks'],
  [5, 'Vida saludable', 3, 'Did you eat breakfast? No, I ___.', 'didn’t', 'don’t', 'wasn’t', 'am not'],

  // Cuentos y pasado
  [5, 'Cuentos y pasado', 1, 'A story begins with «Once upon a ___».', 'time', 'day', 'week', 'year'],
  [5, 'Cuentos y pasado', 1, 'The past of «walk» is ___.', 'walked', 'walks', 'walking', 'walken'],
  [5, 'Cuentos y pasado', 2, 'First, Pedro woke up. ___, he ate breakfast. Finally, he went to school.', 'Then', 'But', 'Because', 'Or'],
  [5, 'Cuentos y pasado', 2, 'The past of «see» is ___.', 'saw', 'seed', 'seen', 'sees'],
  [5, 'Cuentos y pasado', 2, 'The past of «run» is ___.', 'ran', 'runned', 'running', 'runs'],
  [5, 'Cuentos y pasado', 2, 'The «characters» of a story are…', 'los personajes', 'los lugares', 'las páginas', 'los dibujos'],
  [5, 'Cuentos y pasado', 3, 'The past of «write» is ___.', 'wrote', 'writed', 'written', 'wrate'],
  [5, 'Cuentos y pasado', 3, 'The past of «buy» is ___.', 'bought', 'buyed', 'boughted', 'buys'],
  [5, 'Cuentos y pasado', 3, 'Long ago, a princess ___ in a castle.', 'lived', 'live', 'lives', 'living'],

  // Pasatiempos y fin de semana
  [5, 'Pasatiempos y fin de semana', 1, 'A hobby is something you do for ___.', 'fun', 'money', 'homework', 'dinner'],
  [5, 'Pasatiempos y fin de semana', 1, '🎸 What instrument is this?', 'guitar', 'piano', 'drum', 'violin'],
  [5, 'Pasatiempos y fin de semana', 1, 'How was your weekend? It ___ great!', 'was', 'were', 'is', 'am'],
  [5, 'Pasatiempos y fin de semana', 2, 'Do you have plans for the weekend? Yes, I am going to ___ my grandmother.', 'visit', 'visiting', 'visited', 'visits'],
  [5, 'Pasatiempos y fin de semana', 2, 'We ___ to the beach last Saturday.', 'went', 'go', 'goes', 'going'],
  [5, 'Pasatiempos y fin de semana', 2, 'What do you do for fun? I like ___ soccer.', 'playing', 'play', 'plays', 'played'],

  // Gramática básica
  [5, 'Gramática básica', 2, 'good, better, ___', 'best', 'well', 'goodest', 'gooder'],
  [5, 'Gramática básica', 2, 'Sofía is the ___ student in my class. (tall)', 'tallest', 'taller', 'most tall', 'tall'],
  [5, 'Gramática básica', 3, 'This movie is ___ than that one. (bad)', 'worse', 'worst', 'badder', 'more bad'],
  [5, 'Gramática básica', 3, 'Math is ___ than art for me. (interesting)', 'more interesting', 'interestinger', 'most interesting', 'interesting'],

  // ───────────── 6.º ─────────────
  // Héroes y personajes
  [6, 'Héroes y personajes', 1, 'A hero is a person who ___ other people.', 'helps', 'scares', 'forgets', 'sells'],
  [6, 'Héroes y personajes', 1, '🚒 Who works with this truck?', 'a firefighter', 'a teacher', 'a farmer', 'a dentist'],
  [6, 'Héroes y personajes', 1, '«Brave» significa…', 'valiente', 'cansado', 'pequeño', 'triste'],
  [6, 'Héroes y personajes', 2, 'Juan Santamaría is a Costa Rican national ___.', 'hero', 'beach', 'food', 'volcano'],
  [6, 'Héroes y personajes', 2, 'Long ago, my grandfather ___ a brave man.', 'was', 'were', 'is', 'be'],
  [6, 'Héroes y personajes', 2, 'The firefighters ___ heroes yesterday.', 'were', 'was', 'is', 'am'],
  [6, 'Héroes y personajes', 3, 'Juan Santamaría was born in the province of ___.', 'Alajuela', 'Cartago', 'Heredia', 'Limón'],
  [6, 'Héroes y personajes', 3, 'Juan Santamaría Day is on April ___.', 'eleventh', 'first', 'nineteenth', 'twenty-fifth'],

  // Seguridad digital
  [6, 'Seguridad digital', 1, 'Do not share your address with ___ online.', 'strangers', 'your teacher', 'your mom', 'your family'],
  [6, 'Seguridad digital', 1, 'A strong password has letters, numbers and ___.', 'symbols', 'colors', 'animals', 'songs'],
  [6, 'Seguridad digital', 2, 'Which password is safer?', 'Mf3!x9Lq', '123456', 'password', 'ana2015'],
  [6, 'Seguridad digital', 2, 'Someone online makes you feel bad. Tell a trusted ___.', 'adult', 'stranger', 'robot', 'password'],
  [6, 'Seguridad digital', 2, 'Before you click a strange link, you should ___.', 'ask an adult', 'click it fast', 'share it', 'download it'],
  [6, 'Seguridad digital', 2, 'Too much screen time is bad for your ___.', 'eyes', 'shoes', 'hair', 'nails'],
  [6, 'Seguridad digital', 2, 'You ___ be kind when you write online.', 'should', 'shouldn’t', 'mustn’t', 'can’t'],
  [6, 'Seguridad digital', 3, '«Gadget» significa…', 'aparato', 'contraseña', 'pantalla', 'mensaje'],
  [6, 'Seguridad digital', 3, 'Cyberbullying means…', 'hostigar a alguien por internet', 'jugar en línea', 'comprar por internet', 'descargar música'],

  // Basura y reciclaje
  [6, 'Basura y reciclaje', 1, 'What is litter?', 'trash on the ground', 'a kind of food', 'a plant', 'a school'],
  [6, 'Basura y reciclaje', 1, 'Litter can hurt ___.', 'animals', 'books', 'clouds', 'stars'],
  [6, 'Basura y reciclaje', 1, 'What can I do about litter?', 'Pick it up and use a trash can.', 'Throw it in the river.', 'Leave it on the street.', 'Burn it.'],
  [6, 'Basura y reciclaje', 2, 'Litter is bad ___ it hurts animals.', 'because', 'but', 'and', 'or'],
  [6, 'Basura y reciclaje', 2, 'Litter in the rivers can go to the ___.', 'ocean', 'mountain', 'sky', 'desert'],
  [6, 'Basura y reciclaje', 2, 'You ___ throw litter on the street.', 'mustn’t', 'must', 'can', 'will'],
  [6, 'Basura y reciclaje', 3, 'Plastic bottles take a very long time to ___.', 'break down', 'grow', 'swim', 'sing'],

  // Bosque lluvioso
  [6, 'Bosque lluvioso', 1, 'Which animal lives in the rainforest?', 'jaguar', 'penguin', 'camel', 'polar bear'],
  [6, 'Bosque lluvioso', 1, 'Which is part of the rainforest?', 'tall trees', 'sand dunes', 'snow', 'ice'],
  [6, 'Bosque lluvioso', 2, 'The rainforest is hot and ___.', 'humid', 'dry', 'frozen', 'empty'],
  [6, 'Bosque lluvioso', 2, 'Rainforests give us clean ___.', 'air', 'cars', 'plastic', 'roads'],
  [6, 'Bosque lluvioso', 2, 'Deforestation means cutting down ___.', 'forests', 'houses', 'roads', 'schools'],
  [6, 'Bosque lluvioso', 2, 'Which is a way to rescue the rainforest?', 'plant trees', 'cut trees', 'burn forests', 'build on it'],
  [6, 'Bosque lluvioso', 3, '«Endangered» animals are animals…', 'en peligro de extinción', 'muy grandes', 'muy rápidos', 'de la granja'],

  // Fiestas
  [6, 'Fiestas', 1, '🎈 What is this?', 'balloon', 'cake', 'gift', 'candle'],
  [6, 'Fiestas', 1, '🎁 What is this?', 'gift', 'balloon', 'book', 'bag'],
  [6, 'Fiestas', 1, 'An ___ is a card that asks you to come to a party.', 'invitation', 'exam', 'recipe', 'map'],
  [6, 'Fiestas', 1, 'We sing «Happy Birthday» and blow out the candles on the ___.', 'cake', 'door', 'chair', 'book'],
  [6, 'Fiestas', 2, 'How was the party? It ___ fun!', 'was', 'were', 'is', 'be'],
  [6, 'Fiestas', 2, 'The guests ___ happy.', 'were', 'was', 'is', 'am'],
  [6, 'Fiestas', 2, 'We danced and ___ at the party.', 'sang', 'sing', 'sung', 'singed'],
  [6, 'Fiestas', 2, 'Can you come to my party? Sorry, I ___. I have a test.', 'can’t', 'can', 'am', 'do'],
  [6, 'Fiestas', 3, 'Would you like to come? Yes, I would love ___!', 'to', 'at', 'for', 'in'],

  // Futuro y planes
  [6, 'Futuro y planes', 1, 'A person who flies a plane is a ___.', 'pilot', 'farmer', 'cook', 'nurse'],
  [6, 'Futuro y planes', 1, 'A person who teaches children is a ___.', 'teacher', 'driver', 'painter', 'police officer'],
  [6, 'Futuro y planes', 2, 'I am ___ to study science.', 'going', 'go', 'goes', 'went'],
  [6, 'Futuro y planes', 2, 'Tomorrow it ___ rain.', 'will', 'did', 'was', 'does'],
  [6, 'Futuro y planes', 2, 'Do you have plans for the future? Yes, I ___ going to be a doctor.', 'am', 'is', 'are', 'was'],
  [6, 'Futuro y planes', 2, '«Responsibility» significa…', 'responsabilidad', 'respeto', 'honestidad', 'amistad'],
  [6, 'Futuro y planes', 3, 'Will you be a teacher? No, I ___.', 'won’t', 'don’t', 'wasn’t', 'am not'],
  [6, 'Futuro y planes', 3, 'In the future, I ___ help sick people.', 'will', 'am', 'helped', 'was'],

  // Gramática básica
  [6, 'Gramática básica', 2, 'Which sentence is in the past?', 'I visited my aunt.', 'I visit my aunt.', 'I am visiting my aunt.', 'I will visit my aunt.'],
  [6, 'Gramática básica', 2, 'We ___ at the park last Sunday.', 'were', 'was', 'are', 'is'],
  [6, 'Gramática básica', 3, 'The past of «take» is ___.', 'took', 'taked', 'taken', 'takes'],
  [6, 'Gramática básica', 3, 'The past of «give» is ___.', 'gave', 'gived', 'given', 'gives']
])
