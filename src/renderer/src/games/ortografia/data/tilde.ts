import type { Grade } from '../../../content/types'

/*
 * Palabras para practicar la tilde. Cada una se escribe bien, con su clase al final:
 *   a aguda · g grave · e esdrújula · s sobresdrújula · h hiato (la tilde rompe el diptongo) · d diptongo (sin tilde)
 */
export type StressClass = 'a' | 'g' | 'e' | 's' | 'h' | 'd'

export interface TildeWord {
  grade: Grade
  word: string
  kind: StressClass
}

const t = (grade: Grade, list: string): TildeWord[] =>
  list
    .split(/\s+/)
    .filter(Boolean)
    .map((item) => {
      const [word, kind] = item.split(':')
      return { grade, word, kind: kind as StressClass }
    })

export const tildeWords: TildeWord[] = [
  // ───────── 3.º: agudas y graves ─────────
  ...t(
    3,
    `canción:a camión:a balón:a corazón:a limón:a jabón:a avión:a ratón:a melón:a león:a sofá:a café:a
    bebé:a también:a jamás:a detrás:a inglés:a pantalón:a algodón:a reloj:a animal:a papel:a color:a azul:a
    ciudad:a pared:a feliz:a verdad:a mujer:a doctor:a salud:a amor:a cantar:a comer:a vivir:a jugar:a
    mesa:g casa:g libro:g gato:g perro:g zapato:g camisa:g amigo:g escuela:g pelota:g joven:g examen:g lunes:g
    martes:g tijeras:g mariposa:g árbol:g lápiz:g fácil:g azúcar:g cárcel:g difícil:g útil:g ángel:g
    carácter:g mármol:g césped:g débil:g móvil:g cráter:g`
  ),
  // ───────── 4.º: esdrújulas, hiato y diptongo ─────────
  ...t(
    4,
    `teléfono:e pájaro:e murciélago:e música:e número:e sábado:e lámpara:e médico:e plátano:e cámara:e
    pétalo:e océano:e último:e cántaro:e página:e éxito:e rápido:e mágico:e fantástico:e
    día:h tía:h río:h país:h maíz:h baúl:h raíz:h oído:h caída:h reír:h ríe:h frío:h aún:h ataúd:h alegría:h
    poesía:h María:h
    cuidado:d tiene:d puerta:d agua:d ruido:d cuento:d viaje:d hielo:d peine:d aire:d causa:d
    baile:d siete:d cuatro:d nieve:d fuego:d
    colibrí:a maní:a menú:a bambú:a champú:a rubí:a cortés:a después:a según:a razón:a lección:a
    hospital:a capital:a tenedor:a ladrón:a
    fútbol:g túnel:g ágil:g frágil:g tórax:g cóndor:g néctar:g ámbar:g cadáver:g álbum:g
    sombrero:g cuaderno:g maestra:g naranja:g`
  ),
  // ───────── 5.º ─────────
  ...t(
    5,
    `matemática:e gramática:e física:e química:e pirámide:e décimo:e ángulo:e triángulo:e rectángulo:e
    círculo:e hexágono:e pentágono:e cuadrilátero:e diámetro:e perímetro:e kilómetro:e Pacífico:e
    Atlántico:e volcánico:e eléctrico:e científico:e estadística:e
    cafetería:h geografía:h biología:h energía:h tecnología:h policía:h librería:h panadería:h sandía:h
    peluquería:h zapatería:h pescadería:h farmacia:d gracias:d
    sillón:a jardín:a además:a compás:a adiós:a anís:a ilusión:a pasión:a visión:a estación:a
    sándwich:g cóctel:g récord:g volumen:g origen:g imagen:g margen:g orden:g virgen:g resumen:g
    bodega:g ventana:g semáforo:e teclado:g monitor:a lápices:e
    lluvia:d fiesta:d pueblo:d tierra:d sueño:d
    sábana:e colegio:g`
  ),
  // ───────── 6.º ─────────
  ...t(
    6,
    `dígaselo:s cuéntamelo:s cómpraselo:s llévatelo:s prepáramelo:s regálamelo:s explícaselo:s
    imágenes:e jóvenes:e exámenes:e orígenes:e volúmenes:e márgenes:e regímenes:e
    caracteres:g
    revés:a estás:a alemán:a caimán:a huracán:a capitán:a volcán:a Japón:a
    cáliz:g alcázar:g alférez:g hábil:g dócil:g fértil:g estéril:g volátil:g
    lágrima:e espíritu:e régimen:e héroe:e síntesis:e hipótesis:e
    oír:h freír:h sonreír:h continúa:h actúa:h evalúa:h gradúa:h
    acuario:d pausa:d reina:d tiempo:d aceite:d
    decisión:a organización:a comunicación:a educación:a
    ejército:e cálculo:e término:e público:e pública:e`
  )
]
