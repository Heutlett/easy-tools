import type { Grade } from '../../content/types'

/**
 * Oraciones para «Ordena la oración», escritas como plantillas para que cada grado tenga cientos de oraciones
 * correctas sin repetirse: `{nombre:opción 1|opción 2|opción 3}` define una elección y `{nombre}` la repite.
 * Las opciones van en minúscula (la primera letra de la oración se pone en mayúscula sola) salvo los nombres propios.
 * Si no se escribe un signo final, se agrega el punto.
 *
 * - `ONE`: una sola forma de ordenar las palabras.
 * - `TWO`: dos o más formas válidas (cada una es una plantilla con las mismas elecciones); se aceptan todas.
 *
 * Todas las combinaciones de cada plantilla tienen sentido y concuerdan en género y número.
 * Contexto de Costa Rica: feria del agricultor, gallo pinto, volcanes, pulpería, tortugas…
 */
export interface GradeBank {
  one: string[]
  two: string[][]
}

const g1: GradeBank = {
  one: [
    '{a:el niño|la niña|mi hermano|mi hermana|el tío|la tía} {v:come|compra|quiere} {o:pan|fruta|arroz|queso}',
    '{mi mamá|mi papá|la maestra|el abuelo|la abuela} {lee|mira|compra} {un libro|un cuento|una revista}',
    '{el gato|el perro|el mono|el oso|el loro} {ve|mira} {la luna|el sol|la lluvia}',
    '{la luna|el sol|la estrella} {sale|brilla}',
    '{mi mamá|mi papá|mi abuela|mi tío} {me ayuda|me quiere|me cuida}',
    '{la rana|el pez|el pato} {nada|salta|vive} {en el agua|en el lago|en la charca}',
    '{los niños|las niñas|mis amigos|mis amigas} {juegan|cantan|bailan} en {el patio|la escuela|el parque}',
    '{el cielo|el mar} es {azul|grande|bonito}',
    '{la casa|la luna|la flor} es {bonita|grande|blanca}',
    '{mi mamá|mi abuela|mi tía} cocina {gallo pinto|sopa|arroz con pollo}',
    'esta es {mi casa|mi escuela|mi mesa|mi silla}',
    'yo {leo un libro|como fruta|bebo agua|juego con mi perro}',
    '{el sapo|la rana|el conejo|el pato} {come|salta|duerme} {mucho|poco}',
    '{mi gato|mi perro|mi loro} {duerme|come|juega} en {mi casa|el patio}'
  ],
  two: []
}

const g2: GradeBank = {
  one: [
    '{mi mamá|mi papá|mi abuela|mi tío} prepara {gallo pinto|arroz con frijoles|sopa de pollo|tortillas} para {el almuerzo|la cena}',
    '{la maestra|el maestro|mi hermana|mi primo} lee {un cuento|un libro|una carta} {en la escuela|en la casa|en el parque}',
    '{los gatos|los perros|los pájaros|los caballos} {comen|beben|duermen} {en el campo|en la finca}',
    'el sol {sale|brilla|calienta} {por la mañana|temprano|en el cielo}',
    'la luna {sale|brilla} {por la noche|en el cielo}',
    'me gusta {el gallo pinto|la sopa|el queso|la fruta|el pan con queso}',
    '{mi pueblo|mi barrio} es {bonito|grande|tranquilo}',
    '{mi casa|mi escuela} es {bonita|grande|pequeña}',
    '{los niños|las niñas|mis amigos|mis amigas} juegan {fútbol|con la pelota|con la cuerda}',
    '{el tucán|el loro|el colibrí|la lapa} vuela {alto|rápido|despacio}',
    'hoy es {lunes|martes|miércoles|jueves|viernes}',
    '{mi hermano|mi hermana|mi primo|mi prima} tiene {un perro|un gato|un pájaro|una tortuga}',
    'la lluvia {moja|cae sobre} {el techo|la calle|el jardín}'
  ],
  two: [
    ['hoy {x:mi mamá|mi papá|mi tío|mi tía} {y:cocina|trabaja|descansa}', '{x} {y} hoy'],
    ['en la escuela {x:los niños|las niñas} {y:leen|cantan|juegan}', '{x} {y} en la escuela'],
    [
      'con mi familia vamos {p:a la playa|al parque|a la feria|al mercado|a la finca}',
      'vamos {p} con mi familia'
    ],
    ['por la noche la luna {y:brilla|sale}', 'la luna {y} por la noche'],
    ['mañana iremos {p:a la playa|a la feria|a la finca|a casa de mi abuela}', 'iremos {p} mañana']
  ]
}

const g3: GradeBank = {
  one: [
    '¿dónde {viven|duermen} {los monos|los perezosos|las tortugas|los pájaros}?',
    '¿qué {come|bebe|quiere} {el gato|el perro|el caballo|la vaca}?',
    '¿cómo se llama tu {escuela|maestra|mascota|pueblo}?',
    '¿qué {haces|quieres|prefieres} {hoy|mañana|el sábado}?',
    '¿te gusta {el café|el helado|el fútbol|la música|la playa}?',
    '¿{puedo|podemos} {jugar|cantar|leer} {afuera|ahora}?',
    '¡qué {lindo|bonito|grande} {es el mar|es el volcán|es el parque|es mi pueblo}!',
    '¡qué {linda|grande|alegre} {es mi escuela|es la feria|es la playa}!',
    '¡cuánto me gusta {el gallo pinto|la playa|mi escuela|el recreo}!',
    '¡qué {ricos|sabrosos|frescos} están {los mangos|los tamales|los helados|los jugos}!',
    '{el perezoso|el mono|el tucán|el colibrí} vive en {el bosque|la selva|el árbol|la montaña}',
    'mis abuelos {viven|trabajan|duermen} en {la finca|el campo|el pueblo}',
    'los niños {aprenden|leen|escriben} {en la escuela|con la maestra|en el salón}',
    'la maestra nos {lee|cuenta} {un cuento|una historia|una leyenda}',
    'el volcán {Poás|Irazú|Arenal|Turrialba} está en Costa Rica',
    '{San José|Cartago|Heredia|Alajuela|Limón|Puntarenas|Guanacaste} es una provincia de Costa Rica',
    'la {pulpería|escuela|panadería|feria del agricultor} {abre|cierra} {temprano|tarde}',
    'mi {hermano|primo|tío} juega {fútbol|baloncesto|pelota} con sus amigos',
    'en mi casa {comemos|desayunamos|cenamos} {juntos|temprano|en familia}',
    'el perro de mi vecino {ladra|corre|duerme} {mucho|todo el día}',
    'las abejas {hacen|producen} miel en {la colmena|el panal}',
    'mis amigos y yo {jugamos|cantamos|bailamos} en el recreo',
    'mi {hermana|prima|amiga} {tiene|quiere|compra} {un helado|una bicicleta|un libro|una pelota}'
  ],
  two: [
    [
      'por la mañana, {x:mi mamá|mi papá|mi abuela} {y:cocina|barre|riega las plantas}',
      '{x} {y} por la mañana'
    ],
    [
      '{d:los domingos|los sábados} visitamos a {g:mis abuelos|mis tíos|mis primos}',
      'visitamos a {g} {d}'
    ],
    [
      'después de clases {x:los niños|las niñas|mis amigos} {y:juegan|corren|cantan} en el patio',
      '{x} {y} en el patio después de clases'
    ],
    ['¿vamos {p:a la playa|a la feria|al parque} {t:hoy|mañana}?', '¿vamos {t} {p}?'],
    [
      'en la noche la luna ilumina {x:el mar|el río|el bosque|el pueblo}',
      'la luna ilumina {x} en la noche'
    ],
    [
      'cuando llueve, {x:las ranas|los patos|los niños} {y:saltan|juegan} en los charcos',
      '{x} {y} en los charcos cuando llueve'
    ]
  ]
}

const g4: GradeBank = {
  one: [
    '{mi hermano|mi prima|mi tío|mi amigo} no fue {a la escuela|a la fiesta|al parque|a la feria} porque {llovía mucho|tenía mucha tarea|tenía sueño}',
    '{mi mamá|mi papá|mi abuela|mi tía} compró {tomates|papas|zanahorias|chayotes|frutas} en la feria del agricultor',
    '{el quetzal|el tucán|la lapa roja|el colibrí} vive en los bosques de Costa Rica',
    'los {tucanes|quetzales|colibríes|monos} viven en los bosques de Costa Rica',
    'el perezoso es un animal {tranquilo|lento|salvaje}',
    'el {tucán|quetzal|colibrí} es un ave {colorida|hermosa|conocida}',
    'mi {mamá|papá|abuela|hermana} sabe {cocinar|bailar|cantar|nadar|dibujar} muy bien',
    'el volcán {Poás|Irazú|Arenal|Turrialba} es uno de los volcanes de Costa Rica',
    '{mi papá|mi mamá|la maestra|mi abuela} dice que {debemos|tenemos que} {cuidar|proteger} {el agua|los bosques|los animales|el ambiente}',
    '¿cuál es tu {comida|canción|fruta} favorita?',
    '¿cuál es tu {animal|color|deporte|juego|libro} favorito?',
    '¿cuántos {libros|amigos|hermanos|primos} tienes?',
    '¿cuántas {frutas|tareas|mascotas|primas} tienes?',
    '¡qué {emocionante|divertido|inolvidable|largo} fue el {paseo|partido|viaje|concierto}!',
    '{Cartago|Heredia|Alajuela|Guanacaste|Limón} es una provincia muy bonita de nuestro país'
  ],
  two: [
    [
      'si {x:estudiamos|leemos|practicamos} todos los días, {y:aprendemos|mejoramos} más',
      '{y} más si {x} todos los días'
    ],
    [
      'cuando llueve, los {x:niños|gatos|perros} buscan un lugar seco',
      'los {x} buscan un lugar seco cuando llueve'
    ],
    [
      'mi familia visita a mi {p:abuela|abuelo} {d:los sábados|los domingos|los viernes}',
      '{d} mi familia visita a mi {p}'
    ],
    [
      'en la escuela aprendemos {x:a leer|a escribir|a sumar|a dibujar|a cantar} todos los días',
      'todos los días aprendemos {x} en la escuela'
    ],
    [
      'antes de dormir {x:mi mamá|mi papá|mi abuela} me {y:lee un cuento|canta una canción|da un abrazo}',
      '{x} me {y} antes de dormir'
    ],
    [
      'después de comer, {x:mis hermanos|mis primos|mis amigos} {y:juegan|corren|descansan} en el patio',
      '{x} {y} en el patio después de comer'
    ],
    [
      'aunque llueve, {x:los niños|las niñas|mis amigos} {y:salen a jugar|van a la escuela|corren por el patio}',
      '{x} {y} aunque llueve'
    ],
    [
      '{x:mis hermanos|mis primos|mis amigos} juegan en el patio después de comer',
      'después de comer {x} juegan en el patio'
    ]
  ]
}

const g5: GradeBank = {
  one: [
    'por eso {debemos|necesitamos} {cuidar|proteger} {los ríos|los bosques|las playas|los animales} de nuestro país',
    '{la maestra|el director|mi papá} dijo que {el examen|la exposición|la excursión|la feria} será {el lunes|el martes|el viernes|la próxima semana}',
    'los {estudiantes|maestros|padres} de mi escuela organizaron una {feria|exposición|campaña} de reciclaje',
    'el {café|banano|cacao|arroz|maíz} es un cultivo muy importante en Costa Rica',
    'en el bosque nuboso de Monteverde viven {muchas aves|muchas ranas|muchos insectos|muchos monos}',
    '{la carreta típica|el yigüirro|la guaria morada|el guanacaste} es un símbolo nacional de Costa Rica',
    '{mi hermano|mi prima|mi vecino|mi amiga} aprendió a {nadar|andar en bicicleta|tocar guitarra|cocinar} {con paciencia|con ayuda de sus padres|durante las vacaciones}',
    'el agua es un recurso {importante|necesario|valioso} para {las personas|los animales|las plantas}',
    '{mi abuelo|mi abuela} contaba que antes {no había|casi no había} {luz eléctrica|carros|televisión} en el pueblo',
    'los {científicos|guardaparques|biólogos|estudiantes} estudian {los volcanes|los bosques|las tortugas|las aves} para {proteger la naturaleza|conocer mejor el país|aprender más}',
    '{la tarea era difícil|el camino era largo|el examen fue largo}, sin embargo, {terminamos a tiempo|lo logramos|nos fue bien}',
    '¿por qué es importante {leer|estudiar|cuidar el agua|reciclar} todos los días?',
    '¡cuánto {aprendimos|disfrutamos|reímos} en la excursión de {hoy|ayer}!'
  ],
  two: [
    [
      'mientras {x:mi mamá cocina|mi abuela teje|mi papá lee el periódico}, {y:yo hago la tarea|mis hermanos juegan|el perro duerme}',
      '{y} mientras {x}'
    ],
    [
      'si llueve mucho, {x:el partido|la excursión|el desfile|la feria} se {y:suspende|cancela|pospone}',
      '{x} se {y} si llueve mucho'
    ],
    [
      'aunque estaba cansado, {x:Pablo|Marcos|Esteban} {y:terminó la tarea|ayudó a su mamá|salió a correr}',
      '{x} {y} aunque estaba cansado'
    ],
    [
      'cuando llegamos {x:a la playa|a la finca|a la feria|al parque}, {y:ya estaba oscureciendo|ya había mucha gente|empezaba a llover}',
      '{y} cuando llegamos {x}'
    ],
    [
      'después de la tormenta, {x:salió el sol|apareció un arcoíris|volvió la calma}',
      '{x} después de la tormenta'
    ],
    [
      'para sacar buenas notas, {x:debemos estudiar todos los días|es importante leer mucho|necesitamos poner atención}',
      '{x} para sacar buenas notas'
    ],
    [
      'antes de salir de casa, {x:mi mamá|mi papá|mi abuela} {y:revisa las ventanas|apaga las luces|cierra la puerta}',
      '{x} {y} antes de salir de casa'
    ],
    [
      '{x:mi mamá|mi papá|mi abuela} {y:revisa las ventanas|apaga las luces|cierra la puerta} antes de salir de casa',
      'antes de salir de casa {x} {y}'
    ],
    [
      '{x:los pájaros|las ranas|los grillos} {y:cantan|se despiertan|hacen ruido} por la tarde',
      'por la tarde {x} {y}'
    ]
  ]
}

const g6: GradeBank = {
  one: [
    'la {contaminación|deforestación|basura} es un problema que {afecta|preocupa} a {todos los países|las comunidades|las personas}',
    'el {presidente|alcalde|director|maestro} {reconoció|felicitó|agradeció} a {los estudiantes|las familias|los vecinos} por su esfuerzo',
    'es importante {leer|escuchar|revisar} con atención antes de {responder|opinar|decidir}',
    'los {bosques|ríos|volcanes|humedales} de Costa Rica {son parte de|forman parte de} nuestro patrimonio natural',
    '{mi abuelo|mi abuela|mi tía|mi tío} nos contó que cuando era joven {trabajaba|vivía|estudiaba} {en el campo|en el pueblo|lejos de la ciudad}',
    '{mis compañeros|mis amigos|mis primos} y yo {preparamos|organizamos} {una exposición|un mural|una feria|una obra de teatro} sobre {la naturaleza|el reciclaje|la historia del país}',
    'el {científico|biólogo|guardaparque|ingeniero} explicó {cómo se forman|por qué son importantes|cómo cambian} {los volcanes|los ríos|los bosques|las playas}',
    'Costa Rica es un país reconocido en el mundo por su biodiversidad y por su paz',
    'las mascaradas son una tradición costarricense muy querida',
    'los volcanes de nuestro país forman una cordillera que atraviesa el territorio',
    'el debate fue interesante porque todos escuchamos con respeto las ideas de los demás',
    '¿cómo podemos {cuidar|proteger|conservar} {el agua|los bosques|las playas|la biodiversidad} de nuestro país?'
  ],
  two: [
    [
      'gracias a {x:los guardaparques|los científicos|los voluntarios|las comunidades}, {y:muchas especies están protegidas|los bosques están mejor cuidados|las playas están más limpias}',
      '{y} gracias a {x}'
    ],
    [
      'si cuidamos {x:el agua|el aire|el suelo|los bosques} hoy, las próximas generaciones tendrán un planeta más sano',
      'las próximas generaciones tendrán un planeta más sano si cuidamos {x} hoy'
    ],
    [
      'aunque {x:el camino era largo|el sol era fuerte|la subida era difícil}, los estudiantes {y:llegaron a tiempo|terminaron la excursión|disfrutaron el paseo}',
      'los estudiantes {y} aunque {x}'
    ],
    [
      'cuando terminó {t:la presentación|el concierto|el partido|la obra}, {x:el público aplaudió|los invitados aplaudieron|todos los vecinos aplaudieron} con entusiasmo',
      '{x} con entusiasmo cuando terminó {t}'
    ],
    [
      'mientras {x:los estudiantes leían|la maestra explicaba|el director hablaba}, {y:todos escuchaban en silencio|el salón estaba tranquilo|nadie se movía}',
      '{y} mientras {x}'
    ],
    [
      'para proteger {x:las tortugas|los bosques|los ríos|las aves}, {y:los guardaparques trabajan todos los días|las comunidades se organizan|los estudiantes ayudan}',
      '{y} para proteger {x}'
    ],
    [
      'después de leer el texto, {x:respondimos las preguntas|comentamos las ideas principales|dibujamos lo que entendimos}',
      '{x} después de leer el texto'
    ],
    [
      'los guardaparques trabajan todos los días para proteger {x:las tortugas|los bosques|los ríos|las aves}',
      'para proteger {x} los guardaparques trabajan todos los días'
    ],
    [
      'las comunidades se organizan para proteger {x:las tortugas|los bosques|los ríos|las aves}',
      'para proteger {x} las comunidades se organizan'
    ]
  ]
}

export const BANKS: Record<Grade, GradeBank> = { 1: g1, 2: g2, 3: g3, 4: g4, 5: g5, 6: g6 }
