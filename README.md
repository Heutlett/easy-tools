# Easy Tools

Aplicación de escritorio, gratuita y sin fines de lucro, con herramientas **súper sencillas** para las tareas del día a día de docentes de Costa Rica. Todo en español, sin menús escondidos y sin configuraciones.

Los archivos se procesan en la propia computadora (nada se sube a internet) y los resultados se guardan en **Documentos → Easy Tools**.

## Herramientas

| Herramienta | Qué hace |
|---|---|
| Recortar video | Se elige el inicio y el final con una barra o escribiendo los tiempos |
| Sacar el audio de un video | Video → MP3 |
| Descargar de YouTube | Video (MP4) o solo audio (MP3) a partir de un enlace |
| Unir videos | Junta varios videos en uno, en el orden elegido |
| Unir PDFs | Junta varios PDFs en uno |
| Separar páginas de un PDF | Elegir páginas con miniaturas, o un PDF por página |
| PDF a Word | Deja el Word lo más parecido posible al PDF: cada texto, línea, tabla, color e imagen en su posición exacta |
| Word a PDF | Usa Microsoft Word o LibreOffice si están instalados (queda igual al documento); si no, un método sencillo |
| Recortar imagen | Marco que se mueve y se estira, con formas fijas (1:1, 4:3, 3:4, 16:9); guarda a la resolución original |
| Quitar el fondo de una imagen | IA local (sin internet), resultado PNG transparente |
| PDF a imagen | Una imagen JPG o PNG por página, a 200 ppp, en una carpeta |
| Imagen a PDF | Varias imágenes en un PDF (hoja carta o del tamaño de cada imagen); respeta la rotación de las fotos de celular |
| Temporizador para el aula | Cuenta regresiva grande, pantalla completa, aviso sonoro |
| Número al azar | Número dentro de un rango, con opción de no repetir, historial y pantalla completa |
| Bingo | Tómbola para cantar el bingo (75 bolitas B-I-N-G-O o 90): bolita grande, tablero con lo que ha salido, voz en español que canta cada número y revisor de cartones |
| Ruleta | Gira para elegir un ganador de una lista editable (se recuerda); puede quitar a quien salga |

## Tamaño de la ventana

La app tiene solo dos estados, los que da el propio sistema con los botones de la barra de título:

- **Ventana:** tamaño fijo (1100 × 724 de contenido). No se puede arrastrar para cambiarle el tamaño.
- **Maximizada:** ocupa toda la pantalla y la interfaz se **escala** (hasta 2,4×) para aprovechar el espacio. Se recuerda al volver a abrir.

No hay modo de pantalla completa. La lógica está en `src/main/windowMode.ts`; la interfaz está pensada para ~1100 × 724 px y el resto es escala, así que no hace falta diseñar cada pantalla para varios tamaños.

## Desarrollo

Requisitos: Node.js 22 o superior.

```bash
npm install
npm run setup   # descarga ffmpeg y yt-dlp (para tu sistema) y copia el modelo de IA a resources/
npm run dev
```

En algunas distribuciones de Linux (por ejemplo Ubuntu) `npm run dev` falla con *"The SUID sandbox helper binary was found, but is not configured correctly"*. En ese caso usa `npm run dev:linux`, que arranca con `--no-sandbox` (solo para desarrollo). En Windows no hace falta.

Otros comandos: `npm run typecheck`, `npm run lint`, `npm run format`.

### Instalador de Windows

Compilar para Windows desde Linux/macOS necesita Wine, así que lo más simple es hacerlo en Windows o con GitHub Actions (`.github/workflows/build-windows.yml`, se ejecuta a mano o al subir una etiqueta `v*`):

```bash
npm run build:win   # genera dist/Easy-Tools-<versión>-instalador.exe
```

El instalador se instala con un solo clic, sin asistente, y crea un acceso directo en el escritorio. No está firmado, así que Windows puede mostrar "Windows protegió su PC": hay que elegir *Más información → Ejecutar de todas formas*.

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
scripts/        Descarga de binarios y modelos para el empaquetado
```

## Notas técnicas

- **ffmpeg** (video/audio) y **yt-dlp** (YouTube) viajan dentro de la app. yt-dlp se copia a la carpeta de datos del usuario y trata de actualizarse solo al iniciar, porque YouTube cambia seguido.
- Recortar y unir videos **vuelven a codificar** el video para que el corte sea exacto y el resultado funcione en cualquier reproductor; en videos largos puede tardar unos minutos.
- **Quitar fondo** usa `@imgly/background-removal-node` con `onnxruntime-node`. La librería depende de `sharp`, que se cae dentro de Electron, así que se reemplaza por un módulo vacío al compilar (`src/main/stubs/sharp.ts`): la ventana decodifica la imagen y el proceso principal escribe el PNG.
- **Word a PDF** prefiere un programa de Office de verdad (`src/main/tools/officeEngine.ts`): Microsoft Word en Windows (vía PowerShell/COM, **sin probar** aún en Windows) o LibreOffice (`soffice --headless --convert-to pdf`). Con cualquiera de los dos el PDF queda igual al documento y también se pueden abrir los `.doc` antiguos. Si no hay ninguno (o falla), se usa el método sencillo: `docx-preview` en una ventana oculta (`src/renderer/print.html`) impreso con Chromium; ese método respeta estilos, tablas simples, imágenes, encabezados y pies, pero **no** diseños exactos (filas con alto fijo, cuadros de texto, formas) y no lee `.doc`.
- **PDF a Word** (`src/renderer/src/lib/pdfRead.ts` y `pdfToWordExact.ts`) lee del PDF el texto con su posición, tipo de letra, tamaño, color, escala horizontal y espaciado, además de líneas, rellenos e imágenes. Arma tablas con las columnas en su posición exacta (por huecos del texto, o por la cuadrícula de líneas si la tabla tiene bordes), interlineado exacto en todo, líneas como bordes de celdas y las imágenes ancladas a la hoja. No hace OCR, así que un PDF escaneado no se puede convertir. No copia: vectores curvos, degradados, imágenes giradas ni las de fondo de toda la página.
- Cómo se mide la fidelidad: se convierte un PDF a Word, se dibuja el Word con LibreOffice y se compara contra el original por imagen (desplazamiento medio de la tinta por franjas de la página). Con la factura de ejemplo queda a menos de ~0,4 pt en la página 1.
- **Bingo** narra con `speechSynthesis` usando una voz en español del sistema (`src/renderer/src/lib/useSpanishVoice.ts`). En Windows 10/11 vienen voces como Sabina o Helena; en Linux puede no haber ninguna, y entonces la herramienta lo avisa y funciona sin voz. El juego en curso se guarda al cerrar la app.
- YouTube a veces bloquea la descarga pidiendo "confirmar que no eres un robot" (pasa casi siempre desde servidores, rara vez en una casa). La app muestra un mensaje claro y basta con reintentar más tarde.
