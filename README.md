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
| PDF a Word | Copia el texto (negritas, tamaños, párrafos, encabezado y pie) a un `.docx` editable |
| Word a PDF | Convierte un `.docx` en PDF conservando estilos, tablas, imágenes, encabezados y pies |
| Quitar el fondo de una imagen | IA local (sin internet), resultado PNG transparente |
| Temporizador para el aula | Cuenta regresiva grande, pantalla completa, aviso sonoro |
| Número al azar | Número dentro de un rango, con opción de no repetir, historial y pantalla completa |
| Ruleta | Gira para elegir un ganador de una lista editable (se recuerda); puede quitar a quien salga |

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
- **Word a PDF** dibuja el `.docx` con `docx-preview` en una ventana oculta (`src/renderer/print.html`) y la imprime a PDF con el propio Chromium; no necesita Word ni LibreOffice. Solo lee `.docx`: los `.doc` antiguos hay que guardarlos primero como `.docx`. La fidelidad depende de las tipografías instaladas (en Windows, Calibri, Arial y Times New Roman ya vienen).
- **PDF a Word** reconstruye el documento a partir del texto y su posición (`src/renderer/src/lib/pdfToWord.ts`): párrafos, negritas, cursivas, alineación, columnas con tabuladores, y encabezado/pie con número de página. No hace OCR, así que un PDF escaneado no se puede convertir, y las imágenes y bordes de tablas no se copian.
- YouTube a veces bloquea la descarga pidiendo "confirmar que no eres un robot" (pasa casi siempre desde servidores, rara vez en una casa). La app muestra un mensaje claro y basta con reintentar más tarde.
