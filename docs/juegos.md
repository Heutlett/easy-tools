# Juegos y contenido

Esta guía explica cómo está organizado el contenido educativo de Educando (preguntas, afirmaciones, listas de palabras y parejas) y cómo agregar más. Todo funciona sin internet.

## Contenido que viene con la app

Está en `src/renderer/src/content/`, **un archivo por asignatura** (el nombre del archivo es el identificador de la asignatura):

| Carpeta       | Qué tiene                                             | Lo usan                                           |
| ------------- | ----------------------------------------------------- | ------------------------------------------------- |
| `questions/`  | Preguntas de 4 opciones, por grado, tema y dificultad | ¿Quién quiere ser millonario?, concurso, carrera… |
| `statements/` | Afirmaciones verdaderas o falsas                      | Verdadero o falso                                 |
| `lists/`      | Listas de palabras (con pista opcional)               | Ahorcado, palabras desordenadas…                  |
| `pairs/`      | Parejas de cartas                                     | Memoria                                           |

Asignaturas (`SubjectId`): `matematica`, `espanol`, `ciencias`, `sociales`, `ingles`, `musica`, `cultura`. Grados: 1 a 6 (primaria).

Los tipos están en `content/types.ts` y las funciones para escribir cada fila en `content/define.ts`. Cada pregunta ocupa **una línea**:

```ts
import { defineQuestions } from '../define'

export default defineQuestions('matematica', [
  // [grado, tema, dificultad (1 fácil, 2 media, 3 difícil), pregunta, CORRECTA, incorrecta, incorrecta, incorrecta, explicación (opcional)]
  [
    3,
    'Fracciones',
    1,
    '¿Qué fracción es la mitad?',
    '1/2',
    '1/3',
    '1/4',
    '2/3',
    'La mitad es una de dos partes iguales.'
  ]
])
```

La respuesta **correcta se escribe siempre primero**; los juegos mezclan las opciones al mostrarlas.

Afirmaciones: `[grado, tema, texto, true o false, explicación]` con `defineStatements`. Listas: `defineWordLists` y `definePairLists` (ver `define.ts`).

### Reglas de calidad

- **Una sola respuesta correcta, sin ambigüedad.** Las incorrectas deben ser creíbles pero claramente incorrectas.
- **Nada de «todas las anteriores», «ninguna» ni «A y B»**: las opciones se mezclan, y la revisión lo rechaza.
- **Lenguaje de la edad**: frases cortas en 1.º y 2.º; opciones breves (se proyectan en pantalla).
- **Adaptado a Costa Rica**: colones, lugares, fauna, tradiciones y personajes del país; el vocabulario y los temas siguen los programas de estudio del MEP.
- **Datos que no caducan**: sin cifras que cambian (población, récords, precios). Si no estás seguro de un dato, no lo incluyas.
- **Temas consistentes**: el mismo tema siempre se escribe igual (se usa para filtrar).
- La dificultad es relativa a su grado: 1 fácil, 2 media, 3 difícil.

### Revisar el contenido

```bash
node scripts/validate-content.mjs              # todo
node scripts/validate-content.mjs ciencias     # una sola asignatura
```

Muestra cuántas preguntas hay por asignatura y grado y falla si encuentra errores (opciones repetidas, respuestas fuera de rango, ids repetidos, etc.).

## Contenido propio de quien usa la app

Quien usa la app puede crear sus propias preguntas, afirmaciones y listas desde los juegos; se guardan en la computadora (no se mezclan con las que vienen incluidas) y se pueden exportar e importar como archivo.

## Cómo se hace un juego

Los juegos viven en `src/renderer/src/games/<id>/` y aparecen solos en **Juegos** (con buscador y filtros por asignatura, grado y modo). No hay que registrar nada: basta con crear la carpeta con dos archivos.

```
games/mi-juego/
  meta.ts      export default { title, description, icon, type, subjects, grades, modes, keywords } satisfies GameMeta
  index.tsx    export default function MiJuego(): React.JSX.Element   (sin props)
  style.css    estilos propios (opcional); todas las clases empiezan por un prefijo único del juego (.mj-…)
  data.ts      contenido propio del juego (opcional), si no encaja en content/
```

Una carpeta sin `meta.ts` no se registra como juego (sirve para código compartido entre varios juegos).

`type` es el grupo del catálogo (`preguntas`, `palabras`, `lectura`, `mate`, `ingles`, `musica` o `azar`, ver `GAME_TYPES` en `games/types.ts`): de él salen la sección donde aparece el juego y su color de acento (`--accent`), así que **un juego no elige su propio color**.

**Modelos para copiar:** `games/verdadero-falso/` (elegir contenido → equipos → jugar → final con marcador) y `games/bingo/`.

### Piezas compartidas (no se modifican desde un juego)

| Pieza                              | Para qué                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/games/Pickers.tsx`     | `QuestionPicker`, `StatementPicker`, `WordListPicker`, `PairListPicker`: pantallas para elegir el contenido (filtros por asignatura, grado, tema y dificultad; «Mis preguntas / listas» para agregar lo propio, guardar y abrir archivos)                                                                                    |
| `components/games/PlayerSetup.tsx` | «¿Quién juega?»: toda la clase (con `optional`), equipos (2 a 8, con nombre, color y emoji) o estudiantes de un grupo guardado. Devuelve `Player[]`. Si el juego arma su propia pantalla, `usePlayerChoice` (`lib/games/playerChoice.ts`) + `PlayerPicker` dan lo mismo por separado                                         |
| `components/games/Scoreboard.tsx`  | Marcador grande con botones − y +, resalta al que va ganando y al que le toca                                                                                                                                                                                                                                                |
| `lib/games/players.ts`             | `Player`, `useScores(players)` (puntajes, ranking, líderes), `makeTeams`                                                                                                                                                                                                                                                     |
| `lib/games/shuffle.ts`             | `shuffle`, `pick`, `pickOne`, `shuffleOptions(q)` (al mostrar una pregunta hay que mezclar sus opciones)                                                                                                                                                                                                                     |
| `lib/games/sfx.ts`                 | Sonidos: `sfx.correct/wrong/pop/tick/timeUp/win`, `playTones`, `noteFreq('A4')`                                                                                                                                                                                                                                              |
| `lib/games/useVoice.ts`            | `useVoice('es' \| 'en')`: reproduce audios ya hechos (se descargan con la app; ver `tools/tts-lab/README.md`). Busca el audio por el **texto exacto**, así que lo que el juego dice tiene que ser lo mismo que dice su «collector». Puede no haber voces: el juego debe funcionar igual                                      |
| `lib/games/useCountdown.ts`        | Cuenta regresiva con sonido de fin                                                                                                                                                                                                                                                                                           |
| `lib/random.ts`                    | `randomInt(min, max)` seguro                                                                                                                                                                                                                                                                                                 |
| `lib/nav.ts`                       | `useNav()` (ir a otra pantalla o abrir un juego) y `useGameChrome({ sidebar, ownHeader })`: por omisión un juego ocupa **toda la ventana** (sin barra lateral) bajo un encabezado con «← Juegos»; una pantalla de preparación puede pedir la barra lateral y dibujar su propio encabezado (ver `games/millonario/Setup.tsx`) |
| `lib/usePersistentState.ts`        | Guardar preferencias del juego en la computadora (usar claves que empiecen por `game:<id>:`)                                                                                                                                                                                                                                 |
| `content/banks.ts`                 | `useQuestionBank()` y similares (lo incluido + lo propio), `filterBank`                                                                                                                                                                                                                                                      |
| `components/games/games.css`       | Clases listas: `.g-stage`, `.g-center`, `.g-question`, `.g-options` + `.g-option` (A–D, con `.correct`, `.wrong`, `.dim`), `.g-badge`, `.g-timer`, `.g-win`, y las de `Scoreboard`/`Pickers`                                                                                                                                 |

Además están las clases de siempre (`.btn`, `.btn.big`, `.btn.secondary`, `.pill`, `.panel`, `.field`, `.notice`, `.row`, `.muted`) y los emojis, que funcionan sin internet y sirven de dibujos.

### Reglas de diseño

- **Es para proyectar en un salón**: textos y botones **grandes**, mucho contraste, casi sin texto explicativo (como el resto de la app). Una persona maneja el computador y la clase participa desde sus asientos.
- **Español de Costa Rica**, sin jerga. Lo que se lee tiene que ser correcto (ortografía y tildes).
- **Todo funciona sin internet** y sin librerías nuevas. Mantenerlo liviano: sin imágenes pesadas ni videos; dibujos con emojis, SVG o CSS.
- La ventana tiene solo dos estados (tamaño fijo y maximizada); **no hay pantalla completa ni botones propios de tamaño de ventana**. Hay que verse bien en ambos (probar con `maximize(app)`).
- **Teclado**: lo principal debe poder manejarse con flechas, Espacio o Enter, pero Espacio/Enter no deben activar un botón distinto del enfocado (ver `verdadero-falso`).
- Los juegos con equipos usan `PlayerSetup` y `Scoreboard`; los que usan preguntas o palabras usan los `Pickers`, así la persona puede filtrar por grado y agregar lo suyo.
- Siempre debe haber forma de **salir, reiniciar y volver a elegir** sin cerrar la app. No dejar temporizadores ni voz sonando al salir (limpiar en el `useEffect`).
- Accesibilidad básica: botones reales (`<button>`), `aria-label` donde solo hay emoji, foco visible.
- Nada de contenido violento ni de miedo (por ejemplo, el ahorcado se dibuja como algo amable).
- El código sigue el estilo del proyecto (`npx prettier --write` y `npx eslint` sobre los archivos propios).

### Probar un juego

```bash
npm run dev:linux      # (en Windows: npm run dev)
```

Abre **Juegos**, entra al juego y recórrelo completo: elegir contenido, jugar con y sin equipos, el final, reiniciar y salir. Hay que revisarlo en la ventana normal y también **maximizada** (el botón de maximizar de la ventana), y fijarse en que no salgan errores en la consola de desarrollo (Ctrl + Shift + I).

Antes de entregar un juego o contenido nuevo:

```bash
npm run typecheck && npm run lint
node scripts/validate-content.mjs
```
