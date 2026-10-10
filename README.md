# Educando

Aplicación de escritorio, gratuita y sin fines de lucro, con herramientas **súper sencillas** para las tareas del día a día de docentes de Costa Rica. Todo en español, sin menús escondidos y sin configuraciones.

Los archivos se procesan en la propia computadora (nada se sube a internet) y los resultados se guardan en **Documentos → Educando**.

## Herramientas

| Herramienta                   | Qué hace                                                                                                                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recortar video                | Se elige el inicio y el final con una barra o escribiendo los tiempos                                                                                                                   |
| Sacar el audio de un video    | Video → MP3                                                                                                                                                                             |
| Descargar de YouTube          | Video (MP4) o solo audio (MP3) a partir de un enlace                                                                                                                                    |
| Unir videos                   | Junta varios videos en uno, en el orden elegido                                                                                                                                         |
| Unir PDFs                     | Junta varios PDFs en uno                                                                                                                                                                |
| Separar páginas de un PDF     | Elegir páginas con miniaturas, o un PDF por página                                                                                                                                      |
| PDF a Word                    | Deja el Word lo más parecido posible al PDF: cada texto, línea, tabla, color e imagen en su posición exacta                                                                             |
| Word a PDF                    | Usa Microsoft Word o LibreOffice si están instalados (queda igual al documento); si no, un método sencillo                                                                              |
| Recortar imagen               | Marco que se mueve y se estira, con formas fijas (1:1, 4:3, 3:4, 16:9); guarda a la resolución original                                                                                 |
| Quitar el fondo de una imagen | IA local (sin internet), resultado PNG transparente                                                                                                                                     |
| PDF a imagen                  | Una imagen JPG o PNG por página, a 200 ppp, en una carpeta                                                                                                                              |
| Imagen a PDF                  | Varias imágenes en un PDF (hoja carta o del tamaño de cada imagen); respeta la rotación de las fotos de celular                                                                         |
| Temporizador para el aula     | Cuenta regresiva grande, pantalla completa, aviso sonoro                                                                                                                                |
| Número al azar                | Número dentro de un rango, con opción de no repetir, historial y pantalla completa                                                                                                      |
| Juegos                        | 32 juegos para la clase con buscador y filtros por asignatura, grado y modo de juego (ver más abajo). El bingo está aquí                                                                |
| Lista de estudiantes          | Guarda varios grupos con sus estudiantes (acepta listas pegadas desde Word o Excel) para usarlos en otras herramientas                                                                  |
| Puntos                        | Da puntos (con emojis que suben: ⭐ 1, 💎 5, 👑 10, 💯 100) a tus estudiantes, con la razón: participó, ayudó…, y mira en vivo cuántos lleva cada quien; historial, deshacer y reinicio |
| Ruleta                        | Gira para elegir un ganador de una lista editable (se recuerda); puede cargar un grupo de estudiantes y quitar a quien salga                                                            |

La pantalla de inicio tiene **buscador**, filtro por sección y **favoritos**: la estrella de cada tarjeta la agrega a una fila «Favoritos» que va siempre arriba (si no hay favoritos, no se muestra).

## Juegos

En **Para el aula → Juegos** hay 32 juegos pensados para proyectarse en el salón (texto grande, pocos botones, teclado y sonidos). Se filtran y buscan por asignatura (Matemática, Español, Ciencias, Estudios Sociales, Inglés, Música, Cultura de Costa Rica), grado (1.º a 6.º) y modo (toda la clase, por equipos, por turnos, individual), y también se pueden marcar como favoritos.

| Tipo             | Juegos                                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Preguntas        | ¿Quién quiere ser millonario?, Concurso de preguntas (estilo Jeopardy), Verdadero o falso, Carrera de equipos                          |
| Palabras         | Ahorcado (un helado que se derrite), Palabras desordenadas, Memoria, Imagen escondida, Rompecabezas, Mímica y adivinanzas, ¿Quién soy? |
| Lectura y lengua | Arma la palabra (sílabas), Lectura veloz, Ordena la oración, Comprensión de lectura, Ortografía, Trabalenguas y rimas                  |
| Matemática       | Cálculo mental relámpago, Aprende la hora, Monedas y billetes (colones), Fracciones, Dados y monedas                                   |
| Inglés           | What is it?, Listen and choose, Simon says, Build the sentence                                                                         |
| Música           | Lee las notas, Piano, Eco rítmico, Adivina la melodía, ¿Qué instrumento es?                                                            |
| Azar             | Bingo                                                                                                                                  |

**Contenido incluido:** más de 2 400 preguntas de opción múltiple y 1 400 afirmaciones de verdadero o falso por asignatura, grado, tema y dificultad, además de listas de palabras y parejas para memoria. Se basa en los programas de estudio del MEP para I y II ciclos, y todo viene dentro de la app (sin internet). Cada docente puede **agregar sus propias preguntas, afirmaciones y listas**, editarlas, y guardarlas o abrirlas como archivo para compartirlas con otras personas. Detalles para agregar contenido y juegos en [docs/juegos.md](docs/juegos.md); la verificación del contenido se hace con `node scripts/validate-content.mjs`.

> El contenido fue revisado con ayuda de fuentes, pero aún conviene que una docente lo repase: cada informe de revisión dejó una lista de datos por confirmar.

## Tamaño de la ventana

La app tiene solo dos estados, los que da el propio sistema con los botones de la barra de título:

- **Ventana:** tamaño fijo (1100 × 724 de contenido). No se puede arrastrar para cambiarle el tamaño.
- **Maximizada:** ocupa toda la pantalla y la interfaz se **escala** (hasta 2,4×) para aprovechar el espacio. Se recuerda al volver a abrir.

No hay modo de pantalla completa. La lógica está en `src/main/windowMode.ts`; la interfaz está pensada para ~1100 × 724 px y el resto es escala, así que no hace falta diseñar cada pantalla para varios tamaños.

## Desarrollo

Requisitos: Node.js 22 o superior. La app es para **Windows**; en Linux solo se usa para desarrollar (las actualizaciones están pensadas para el instalador de Windows).

```bash
npm install
npm run setup   # solo para desarrollar: baja ffmpeg y yt-dlp (para tu sistema) y copia el modelo de IA a resources/
npm run dev
```

En algunas distribuciones de Linux (por ejemplo Ubuntu) `npm run dev` falla con _"The SUID sandbox helper binary was found, but is not configured correctly"_. En ese caso usa `npm run dev:linux`, que arranca con `--no-sandbox` (solo para desarrollo). En Windows no hace falta.

Otros comandos: `npm run typecheck`, `npm run lint`, `npm run format`.

### Instalador de Windows

Compilar para Windows desde Linux/macOS necesita Wine, así que lo más simple es hacerlo en Windows o con GitHub Actions (`.github/workflows/build-windows.yml`, se ejecuta a mano o al subir una etiqueta `v*`):

```bash
npm run build:win   # genera dist/Educando-<versión>-instalador.exe
```

El instalador se instala con un solo clic, sin asistente, y crea un acceso directo en el escritorio. No está firmado, así que Windows puede mostrar "Windows protegió su PC": hay que elegir _Más información → Ejecutar de todas formas_.

## Publicar una versión nueva (actualizaciones)

La app instalada busca versiones nuevas sola (unos segundos después de abrir y cada 6 horas) y también con el botón de **Acerca de → Buscar actualizaciones**. Si hay una, muestra un aviso con **Actualizar ahora**; descarga, y al reiniciar se instala sola.

Los instaladores se publican como _Releases_ de este mismo repositorio, que tiene que ser **público** para que la app instalada pueda consultarlo sin ninguna clave. No hace falta crear tokens ni secretos: el workflow usa el permiso que GitHub le da por defecto.

**Cada versión:**

1. Siguiendo [GITFLOW.md](GITFLOW.md), en la rama `release/vX.Y.Z`: subir la versión en `package.json` y en `VERSION`, y agregar la entrada de la versión en `CHANGELOG.md` (ese texto será la descripción del release).
2. Crear la etiqueta anotada en `master` y subirla (`git tag -a vX.Y.Z` y `git push origin vX.Y.Z`).
3. GitHub Actions construye el instalador de Windows y lo publica en la sección _Releases_; las apps instaladas lo detectan.

La etiqueta debe coincidir con la versión de `package.json` y de `VERSION` (el workflow lo revisa antes de construir). Los instaladores no están firmados, así que Windows puede mostrar el aviso de SmartScreen la primera vez.

Para probar sin publicar: `EASY_TOOLS_FAKE_UPDATE=1 npm run dev` simula una versión nueva (solo para ver el aviso), y `EASY_TOOLS_UPDATE_URL=http://…` busca en un servidor propio.

## Ícono

El ícono es un lápiz que dibuja una palomita (✓): hacer la tarea fácil de un solo trazo. Los originales vectoriales están en `design/`:

- `icon.svg`: versión completa (con la virola y el borrador del lápiz), para tamaños de 64 px o más.
- `icon-small.svg`: versión simplificada, de trazos más gruesos, para 16 a 48 px (barra de tareas, esquina de la ventana).

De ahí salen `build/icon.ico` (Windows, 7 tamaños: la completa de 64 a 256 px y la simplificada de 16 a 48 px), `build/icon.png`, `resources/icon.png` y `src/renderer/src/assets/logo.svg`. Si se cambia el diseño hay que regenerar esos archivos a partir de los SVG.

## Cómo agregar una herramienta

1. Crear la carpeta `src/renderer/src/tools/<nombre>/` con dos archivos:
   - `meta.ts`: título, descripción, ícono, color y posición en la pantalla de inicio.
   - `index.tsx`: el componente de la herramienta (`export default`).
2. Si necesita procesar archivos, agregar su lógica en `src/main/tools/` y exponerla en `src/preload/index.ts`.

`meta.ts` incluye la `category` (las secciones de la pantalla de inicio están en `src/renderer/src/tools/categories.ts`). La pantalla de inicio descubre las herramientas automáticamente; no hay que registrarlas en ningún otro lugar.

## Íconos

Las herramientas con logos de YouTube, Word y PDF usan los íconos oficiales (descargados de Wikimedia Commons) que están en `src/renderer/src/assets/icons/`. Son marcas registradas de sus dueños; el proyecto es de uso personal. Si algún día se publica la app o el repositorio, conviene reemplazarlos por íconos propios: basta cambiar esos archivos o quitar `images` del `meta.ts` de cada herramienta para volver al emoji.

## Estructura

```
src/main/       Proceso principal de Electron: ffmpeg, yt-dlp, PDFs, quitar fondo
src/preload/    API segura que usa la ventana para hablar con el proceso principal
src/renderer/   Interfaz (React): pantalla de inicio, componentes y herramientas
src/shared/     Tipos compartidos
scripts/        Descarga de binarios y modelos para desarrollar, y revisión del contenido
```

## Notas técnicas

- **Piezas que se descargan la primera vez** (`src/main/components.ts`, `src/shared/components.ts`): ffmpeg (video y audio, ~30 MB), yt-dlp (YouTube, ~18 MB) y el modelo de IA de quitar fondos (~88 MB) **no viajan en el instalador**, para que pese mucho menos. Se bajan una sola vez desde el aviso de la pantalla de inicio o al abrir la primera herramienta que las necesita, y se guardan en la carpeta de datos de la app (así las actualizaciones no las vuelven a bajar). ffmpeg viene de `eugeneware/ffmpeg-static`, yt-dlp de sus releases oficiales y el modelo del CDN de IMG.LY (cada pedazo se verifica con su SHA-256). yt-dlp trata de actualizarse solo al iniciar, porque YouTube cambia seguido. Al desarrollar, lo que baje `npm run setup` a `resources/` cuenta como ya descargado; para probar la descarga: `EASY_TOOLS_IGNORE_BUNDLED=1` y, para no usar internet, `EASY_TOOLS_COMPONENTS_URL=http://127.0.0.1:PUERTO` con `ffmpeg.gz`, `yt-dlp` y `model/`.
- Recortar y unir videos **vuelven a codificar** el video para que el corte sea exacto y el resultado funcione en cualquier reproductor; en videos largos puede tardar unos minutos.
- **Quitar fondo** usa `@imgly/background-removal-node` con `onnxruntime-node`. La librería depende de `sharp`, que se cae dentro de Electron, así que se reemplaza por un módulo vacío al compilar (`src/main/stubs/sharp.ts`): la ventana decodifica la imagen y el proceso principal escribe el PNG.
- **Word a PDF** prefiere un programa de Office de verdad (`src/main/tools/officeEngine.ts`): Microsoft Word en Windows (vía PowerShell/COM, **sin probar** aún en Windows) o LibreOffice (`soffice --headless --convert-to pdf`). Con cualquiera de los dos el PDF queda igual al documento y también se pueden abrir los `.doc` antiguos. Si no hay ninguno (o falla), se usa el método sencillo: `docx-preview` en una ventana oculta (`src/renderer/print.html`) impreso con Chromium; ese método respeta estilos, tablas simples, imágenes, encabezados y pies, pero **no** diseños exactos (filas con alto fijo, cuadros de texto, formas) y no lee `.doc`.
- **PDF a Word** (`src/renderer/src/lib/pdfRead.ts` y `pdfToWordExact.ts`) lee del PDF el texto con su posición, tipo de letra, tamaño, color, escala horizontal y espaciado, además de líneas, rellenos e imágenes. Arma tablas con las columnas en su posición exacta (por huecos del texto, o por la cuadrícula de líneas si la tabla tiene bordes), interlineado exacto en todo, líneas como bordes de celdas y las imágenes ancladas a la hoja. No hace OCR, así que un PDF escaneado no se puede convertir. No copia: vectores curvos, degradados, imágenes giradas ni las de fondo de toda la página.
- Cómo se mide la fidelidad: se convierte un PDF a Word, se dibuja el Word con LibreOffice y se compara contra el original por imagen (desplazamiento medio de la tinta por franjas de la página). Con la factura de ejemplo queda a menos de ~0,4 pt en la página 1.
- **Estudiantes y puntos:** los grupos se guardan en la computadora (almacenamiento local de la app, en `src/renderer/src/lib/classrooms.ts`) y cada estudiante tiene un identificador propio, así que renombrar a alguien o tener dos con el mismo nombre no mezcla sus puntos. Los puntos se guardan como eventos (quién, por qué razón y cuándo), de donde salen el conteo y el historial. Otras herramientas pueden usar los grupos con `useClassrooms()`.
- **Bingo** narra con `speechSynthesis` usando una voz en español del sistema (`src/renderer/src/lib/useSpanishVoice.ts`). En Windows 10/11 vienen voces como Sabina o Helena; en Linux puede no haber ninguna, y entonces la herramienta lo avisa y funciona sin voz. El juego en curso se guarda al cerrar la app.
- YouTube a veces bloquea la descarga pidiendo "confirmar que no eres un robot" (pasa casi siempre desde servidores, rara vez en una casa). La app muestra un mensaje claro y basta con reintentar más tarde.

## Licencia

[MIT](LICENSE): puedes usar, copiar y modificar Educando libremente.
