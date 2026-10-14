# Laboratorio de voces (TTS)

Genera los **audios de las voces** de Educando. La app **no genera voz mientras se usa**: los juegos que leen en voz alta (comprensión de lectura, Bingo, «Listen and choose»…) reproducen **audios ya hechos** que se descargan como un recurso más. Este laboratorio es la herramienta para hacer esos audios, en una computadora con tarjeta NVIDIA, y volver a hacerlos cuando se agregan textos, palabras o juegos nuevos.

- **Modelo:** [Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS) 1.7B (Apache-2.0), español e inglés. Dos modelos: _VoiceDesign_ (inventa una voz a partir de una descripción) y _Base_ (clona una voz). Revisiones fijas en `common.py`.
- **Voz fija por idioma:** `voices/es/` y `voices/en/` (un audio de referencia de ~9 s y su descripción). Todos los audios de un idioma se generan **clonando esa voz**, así suenan igual aunque se hagan en días distintos. Van en git (son livianos).
- **Lo que pesa no va en git:** el entorno de Python (`.venv/`), los modelos (`models/`, ~9 GB) y los audios generados (`out/`).

## Requisitos

- Una tarjeta NVIDIA con **8 GB de memoria de video o más** (se probó con una RTX 5060). Con 8 GB cabe un modelo a la vez.
- ~15 GB de disco libre, [`uv`](https://docs.astral.sh/uv/) y `ffmpeg` (el del sistema o el que baja `npm run setup` en `resources/bin`).
- Probado en Linux. En otra tarjeta, cambia la versión de PyTorch: `TORCH_INDEX=https://download.pytorch.org/whl/cu126 ./setup.sh` (las RTX 50 necesitan `cu128`).

## Primera vez

```bash
cd tools/tts-lab
./setup.sh                              # crea .venv con PyTorch (CUDA) y qwen-tts
.venv/bin/python download_models.py     # baja los dos modelos a models/ (~9 GB; solo una vez)
```

`download_models.py --check` dice si ya están. Si ya tienes los modelos en otro lado, pon `models/hf` como enlace a esa carpeta.

## Generar los audios

```bash
npm run tts:manifest                    # (desde la raíz del repo) arma manifest.json: todo lo que dicen los juegos
cd tools/tts-lab
.venv/bin/python generate.py            # genera lo que falte o haya cambiado
```

`generate.py` es **incremental**: guarda en `out/index.json` el texto y la voz de cada audio, y solo rehace lo que no existe o cambió. Si se interrumpe, se vuelve a correr y sigue (no borres ni muevas `out/` mientras corre). Los audios cortos se generan **en lotes** (unos 360 caracteres juntos como máximo: con 8 GB de video, más se llena la memoria); los largos, de a uno. Filtros útiles:

```bash
.venv/bin/python generate.py --game bingo
.venv/bin/python generate.py --id es/comprension/como-hacer --limit 3     # probar con pocos
.venv/bin/python generate.py --force --lang es                            # rehacer un idioma (por ejemplo si cambió la voz)
```

**Resultado** (`out/`): `<idioma>/<juego>/<nombre>.opus` (Opus mono, 40 kbps, nivelado a -18 LUFS) y, donde el juego tiene velocidades, `<nombre>.slow.opus` (65 %) y `<nombre>.fast.opus` (130 %): son el audio normal estirado con `atempo`, sin cambiar el tono. **`out/index.json`** es el catálogo: `id → { text, lang, seconds, files }`.

**Cómo encuentra el juego su audio:** por el **texto exacto** y el idioma (el juego busca en `index.json` el audio de `"Ge, cincuenta y ocho. Cinco, ocho."`). Por eso cada collector tiene que decir exactamente lo mismo que dice el juego. El nombre del archivo (el `id`) es solo una forma ordenada de guardarlo.

**Medido con todo lo que hay hoy (6 juegos):** 6217 audios, **10239 archivos, 111 MB**, 227 min de voz normal. Por juego: inglés 70 MB, Ordena la oración 20 MB, comprensión 11 MB, trabalenguas 5 MB, palabras 2 MB, Bingo 2 MB (el inglés pesa más porque casi todo tiene versión lenta y «Simon says» también rápida). Generarlo todo toma **~2 horas** en una RTX 5060 (≈ 1.2 veces tiempo real los textos largos; los cortos, mucho más rápido en lotes). Si hay que ahorrar peso: quitar `slow`/`fast` y usar `playbackRate` del navegador (conserva el tono) baja unos 40 MB; bajar a 32 kbps, ~20 %.

### Si un audio salió mal

El modelo genera con algo de azar, así que **otra toma suele arreglarlo** (una palabra comida, un énfasis raro, un ruido). Repetir `generate.py --force` sobre ese id **no cambia nada**: la semilla sale del id y da la misma toma. Se pide otra con `--take`:

```bash
.venv/bin/python generate.py --id es/palabras/ala --take 2    # el id completo, no solo el principio
```

Cada toma es distinta y **repetible** (la misma toma da siempre el mismo sonido), y queda anotada en `takes.json`: **haz commit de ese archivo** para que quien regenere los audios después obtenga la toma buena y no la mala. Se escucha, y si tampoco gusta, se prueba la 3, la 4… Si ninguna toma sale bien, el problema es del texto y no del azar: cámbialo en el collector (por ejemplo una palabra suelta «ala» a veces sale cortada; con una frase corta como «Ala.» o dentro de una oración suele salir mejor), o escríbelo como se pronuncia.

### Control de calidad

- Cada texto largo se genera **por párrafos** (los muy largos, por oraciones) y se unen con pausas; así el modelo no se desvía.
- Si un audio sale demasiado corto o largo para su texto, se vuelve a generar con otra semilla (hasta 4 veces) y se avisa con `⚠`.
- **No hay verificación automática del contenido.** Se probó con reconocedores de voz (español: NeMo Conformer CTC sin modelo de lenguaje; inglés: Whisper base) y sirven para detectar problemas gruesos, pero se equivocan con clips de una o dos palabras y con palabras raras. **Hay que escuchar una muestra** antes de dar por buenos los audios nuevos.
- Qué lee mal el modelo en español: los signos de las cuentas («7 × 8» lo dice «siete en ocho»; usa «por», «más», «menos», «es igual a»), las fracciones («3/4» sale «tres cuatro»; escribe «tres cuartos») y las letras sueltas («A», «Be» salen mal; «Opción A.» sí). Las cifras comunes («125», «1821», «25 %») las lee bien.

## Publicar los audios (que la app los descargue)

La app baja los audios como un componente más: **un solo `.zip`** (sin comprimir otra vez, con `index.json` en la raíz) que se publica como archivo de un release de GitHub. Los datos del paquete están en `src/shared/voices.ts` (`VOICES_PACK`).

```bash
cd tools/tts-lab
python3 package.py --version 2          # crea dist/Educando-voces-2.zip e imprime su tamaño y SHA-256 (no necesita GPU)
```

1. Sube `dist/Educando-voces-<versión>.zip` a GitHub como archivo de un release nuevo (por ejemplo, la etiqueta `voces-2`, marcado como _pre-release_ para que no aparezca como la versión de la app).
2. En `src/shared/voices.ts` pon la `version`, el `sha256`, el `sizeMB` y la `url` que imprimió el script.
3. Publica una versión de la app con ese cambio. Quien ya tenía otro paquete baja el nuevo solo (la marca de «completo» guarda el SHA-256 del paquete instalado).

Solo viajan los audios que están en `manifest.json` hoy (los que sobraron en `out/` no). Para probar sin internet: `EASY_TOOLS_COMPONENTS_URL=http://127.0.0.1:8000 npm run dev` con una carpeta que tenga `voices.zip` (y `EASY_TOOLS_NO_AUTO_DOWNLOAD=1` para que no baje nada solo).

## ¿Qué dice cada juego? (los «collectors»)

`collect.mjs` junta, con los **mismos datos que usan los juegos**, la lista de textos que hay que convertir en audio. Cada juego tiene su archivo en `collectors/` que devuelve `Item[]` (`id`, `lang`, `text`, `variants?`); `collectors/index.ts` los junta, une los textos repetidos (un mismo texto en varios juegos es un solo audio) y distingue con una huella los que dieran el mismo nombre.

| Juego                  | Archivo              | Qué se dice                                                                                                                                                                                                          | Id                                              |
| ---------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Comprensión de lectura | `comprension.ts`     | cada texto (título y párrafos) y cada pregunta                                                                                                                                                                       | `es/comprension/<titulo>` y `…/q1…qN`           |
| Bingo                  | `bingo.ts`           | los 75 cantos con letra y los 90 sin letra, con las cifras en palabras                                                                                                                                               | `es/bingo/75-<n>`, `es/bingo/90-<n>`            |
| Inglés (4 juegos)      | `ingles.ts`          | **Listen and choose** (palabras, frases, preguntas y respuestas, con `slow`), **¿Qué es?** (palabras), **Build the sentence** (oraciones) y **Simon says** (cada orden sola y con «Simon says», con `slow` y `fast`) | `en/ingles/<texto>`                             |
| Lectura por sílabas    | `lectura-silabas.ts` | cada palabra completa                                                                                                                                                                                                | `es/palabras/<palabra>`                         |
| Ordena la oración      | `ordena-oracion.ts`  | las ~1900 oraciones que salen de las plantillas (todas las combinaciones y formas válidas)                                                                                                                           | `es/ordena-oracion/<oración>`                   |
| Trabalenguas y rimas   | `trabalenguas.ts`    | cada trabalenguas (con `slow` y `fast`), la palabra de «Busca la rima» y cada verso completo                                                                                                                         | `es/trabalenguas/<id>`, `es/palabras/<palabra>` |

**No leen en voz alta, a propósito:** ¿Quién quiere ser millonario? (son miles de preguntas con opciones que se mezclan y las del docente no tendrían audio), el Concurso y Ortografía.

### Agregar texto, palabras o un juego nuevo

1. **Más texto en un juego que ya está** (otro texto de comprensión, palabras de vocabulario, frases…): se agrega en los datos del juego, como siempre. Luego `npm run tts:manifest` y `generate.py`: solo se generan los audios nuevos.
2. **Un juego nuevo que lea en voz alta:** crear `collectors/<juego>.ts` que exporte `collect(): Item[]`, sumarlo a `GAMES` en `collectors/index.ts` y correr los dos pasos. **El texto que dice el collector tiene que ser el mismo que dice el juego** (hay un comentario al inicio de cada collector con su fuente; lo mejor es que los dos usen la misma función, como `bingoSpeech` en `src/shared/speech/bingo.ts`). Si el juego pide un texto que no está, en la consola de la app sale `[voz] No hay audio para…`. Si el juego ofrece velocidades, pon `variants: ['slow']` o `['slow', 'fast']`. Escribe con palabras lo que el modelo lee mal (ver «Control de calidad»); en el Bingo las cifras van con letras a mano.
3. **Quitar o cambiar texto:** los audios que ya no estén en el manifiesto se quedan en `out/` (no se borran solos); borra `out/` y vuelve a generar si quieres empezar limpio (~2 horas).

## Cambiar una voz

```bash
.venv/bin/python design_voice.py es --seeds 7,8,9,10    # candidatas en candidates/ (escúchalas)
.venv/bin/python design_voice.py es --accept 8          # la elegida pasa a voices/es/ (haz commit)
.venv/bin/python generate.py --force --lang es          # hay que rehacer TODOS los audios de ese idioma
```

La descripción de cada voz está en `design_voice.py` (`DEFAULTS`). Los audios se rehacen solos si cambia `voices/<idioma>/ref.wav` (la huella de la voz forma parte del control de cambios).

## Archivos

| Archivo                                                              | Para qué                                                  |
| -------------------------------------------------------------------- | --------------------------------------------------------- |
| `setup.sh`, `requirements.txt`                                       | entorno de Python                                         |
| `download_models.py`                                                 | baja los modelos (revisiones fijas)                       |
| `design_voice.py`                                                    | crea o cambia la voz fija de un idioma                    |
| `collect.mjs`, `collectors/`                                         | arman `manifest.json` desde los datos de los juegos       |
| `generate.py`                                                        | genera, nivela y codifica los audios                      |
| `package.py`                                                         | arma el `.zip` que descarga la app (`dist/`)              |
| `common.py`                                                          | rutas, revisiones de los modelos, utilidades              |
| `voices/<idioma>/`                                                   | la voz fija (`ref.wav` + `voice.json`) — **sí va en git** |
| `models/`, `.venv/`, `out/`, `dist/`, `candidates/`, `manifest.json` | generados o pesados — **no van en git**                   |

## Licencias

Qwen3-TTS es Apache-2.0: los audios generados se pueden usar y distribuir con la app. No uses modelos de «solo investigación» (Fish Audio, Higgs, XTTS…) para audios que van en la app.
