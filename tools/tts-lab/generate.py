"""Genera los audios de manifest.json con la voz fija de cada idioma (clonada de voices/<idioma>/ref.wav).

  .venv/bin/python generate.py                       # todo lo que falte o haya cambiado
  .venv/bin/python generate.py --game bingo          # solo un juego
  .venv/bin/python generate.py --id es/comprension/como-hacer --limit 3
  .venv/bin/python generate.py --force --lang es     # rehacer todo un idioma (por ejemplo si cambió la voz)

Es incremental: guarda out/index.json con el texto y la voz de cada audio, y solo vuelve a generar lo que no existe o cambió.
Si se interrumpe, al correrlo de nuevo sigue donde se quedó.
"""
import argparse
import hashlib
import json
import re
import shutil
import tempfile
import time
from pathlib import Path

import numpy as np
import soundfile as sf
import torch

from common import BASE, LANGUAGE_NAME, ROOT, SAMPLE_RATE, load_model, run_ffmpeg

# Pausas entre bloques de un texto largo (segundos)
PARAGRAPH_PAUSE = 0.6
SENTENCE_PAUSE = 0.3
MAX_BLOCK = 280
# Velocidades alternativas (se estira el audio normal con `atempo`, sin cambiar el tono)
TEMPOS = {"slow": 0.65, "fast": 1.3}
TRIES = 4
# Audios cortos en lotes. El límite es de caracteres, no de cantidad: con 8 GB de video caben ~360 caracteres juntos (con ~700 se llena)
BATCH = 8
BATCH_CHARS = 360
BATCH_MAX_CHARS = 200
# Cuántos caracteres por segundo se espera que salgan al hablar (para detectar audios cortados o con relleno)
CHARS_PER_SECOND = {"es": 14.0, "en": 15.0}

parser = argparse.ArgumentParser()
parser.add_argument("--manifest", default=str(ROOT / "manifest.json"))
parser.add_argument("--out", default=str(ROOT / "out"))
parser.add_argument("--lang", choices=sorted(LANGUAGE_NAME))
parser.add_argument("--game", help="solo los de este juego (el segundo tramo del id: es/<juego>/…)")
parser.add_argument("--id", action="append", help="solo los ids que empiecen con esto (ej. es/comprension/barco); se puede repetir")
parser.add_argument("--limit", type=int, help="máximo de audios a generar (para probar)")
parser.add_argument("--force", action="store_true", help="rehacer aunque ya existan")
parser.add_argument("--bitrate", default="40k")
parser.add_argument("--take", type=int, help="otra toma para los audios elegidos (con --id o --game): sale distinta y queda anotada en takes.json")
args = parser.parse_args()

out = Path(args.out)
items = json.load(open(args.manifest))
items = [
    i
    for i in items
    if (not args.lang or i["lang"] == args.lang)
    and (not args.game or i["id"].split("/")[1] == args.game)
    and (not args.id or any(i["id"].startswith(prefix) for prefix in args.id))
]
if not items:
    raise SystemExit("No hay nada que generar con esos filtros.")

# El archivo temporal va fuera de out/: si alguien borra out/ en pleno trabajo, no se cae el proceso
WORK = Path(tempfile.mkdtemp(prefix="tts-lab-"))
TAKES_PATH = ROOT / "takes.json"
takes = json.load(open(TAKES_PATH)) if TAKES_PATH.exists() else {}
index_path = out / "index.json"
index = json.load(open(index_path)) if index_path.exists() else {}

# --- voces fijas
model = load_model(BASE)
prompts, voice_version = {}, {}
for lang in sorted({i["lang"] for i in items}):
    ref = ROOT / "voices" / lang
    if not (ref / "ref.wav").exists():
        raise SystemExit(f"Falta la voz de «{lang}»: corre design_voice.py {lang} (ver README).")
    meta = json.load(open(ref / "voice.json"))
    prompts[lang] = model.create_voice_clone_prompt(ref_audio=str(ref / "ref.wav"), ref_text=meta["text"])
    # Si cambia la voz, todos los audios de ese idioma quedan «viejos» y se rehacen
    voice_version[lang] = hashlib.sha1((ref / "ref.wav").read_bytes()).hexdigest()[:10]


def fingerprint(item):
    parts = [item["lang"], item["text"], voice_version[item["lang"]], str(sorted(item.get("variants") or []))]
    # La toma solo cuenta si no es la normal (así los audios hechos antes no se consideran cambiados)
    if takes.get(item["id"]):
        parts.append(f'toma{takes[item["id"]]}')
    return hashlib.sha1("|".join(parts).encode()).hexdigest()[:16]


def seed_for(key, attempt, take=0):
    return int(hashlib.sha1(key.encode()).hexdigest()[:8], 16) % 1_000_000 + attempt + take * 10_000


def split_blocks(text):
    """Cada párrafo se genera aparte; los muy largos se parten por oraciones."""
    blocks = []
    for paragraph in [p.strip() for p in re.split(r"\n+", text) if p.strip()]:
        if len(paragraph) <= MAX_BLOCK:
            blocks.append((paragraph, PARAGRAPH_PAUSE))
            continue
        sentences = re.findall(r"[^.!?…]+[.!?…]*", paragraph)
        current = ""
        pieces = []
        for s in sentences:
            if current and len(current) + len(s) > MAX_BLOCK:
                pieces.append(current.strip())
                current = s
            else:
                current += s
        if current.strip():
            pieces.append(current.strip())
        for k, piece in enumerate(pieces):
            blocks.append((piece, PARAGRAPH_PAUSE if k == len(pieces) - 1 else SENTENCE_PAUSE))
    return blocks


def trim(x, sr, head=0.12, tail=0.15, threshold=0.004):
    loud = np.flatnonzero(np.abs(x) > threshold)
    if loud.size == 0:
        return x
    start = max(0, loud[0] - int(head * sr))
    end = min(len(x), loud[-1] + int(tail * sr))
    return x[start:end]


def synth_block(item, text, key):
    take = takes.get(item["id"], 0)
    """Genera un bloque; si sale demasiado corto o largo para su texto, lo intenta con otra semilla."""
    expected = max(0.4, len(text) / CHARS_PER_SECOND[item["lang"]])
    best, best_error = None, 1e9
    for attempt in range(TRIES):
        torch.manual_seed(seed_for(key, attempt, take))
        wavs, sr = model.generate_voice_clone(
            text=text, language=LANGUAGE_NAME[item["lang"]], voice_clone_prompt=prompts[item["lang"]]
        )
        x = trim(np.asarray(wavs[0], dtype=np.float32), sr)
        ratio = (len(x) / sr) / expected
        error = abs(np.log(max(ratio, 1e-3)))
        if error < best_error:
            best, best_error = x, error
        if 0.45 <= ratio <= 2.2:
            return x, sr
    print(f"   ⚠ duración rara en «{text[:40]}…» (se usó el mejor de {TRIES} intentos)")
    return best, sr


def synth_batch(batch):
    """Genera varios audios cortos a la vez (con un solo texto cada uno): unas 6 veces más rápido que de a uno.
    Devuelve [(audio, sr)] y None en los que salieron raros (esos se rehacen de a uno, con reintentos)."""
    lang = batch[0]["lang"]
    texts = [i["text"] for i in batch]
    torch.manual_seed(seed_for(batch[0]["id"], 0))
    try:
        wavs, sr = model.generate_voice_clone(
            text=texts, language=[LANGUAGE_NAME[lang]] * len(texts), voice_clone_prompt=prompts[lang] * len(texts)
        )
    except torch.OutOfMemoryError:
        torch.cuda.empty_cache()
        if len(batch) == 1:
            raise
        half = len(batch) // 2
        return synth_batch(batch[:half]) + synth_batch(batch[half:])
    out_list = []
    for item, w in zip(batch, wavs):
        x = trim(np.asarray(w, dtype=np.float32), sr)
        expected = max(0.4, len(item["text"]) / CHARS_PER_SECOND[lang])
        ratio = (len(x) / sr) / expected
        out_list.append((x, sr) if 0.45 <= ratio <= 2.2 else None)
    return out_list


def synth(item):
    parts, sr = [], SAMPLE_RATE
    blocks = split_blocks(item["text"])
    for n, (text, pause) in enumerate(blocks):
        x, sr = synth_block(item, text, f'{item["id"]}#{n}')
        parts.append(x)
        if n < len(blocks) - 1:
            parts.append(np.zeros(int(pause * sr), dtype=np.float32))
    return np.concatenate(parts), sr


def encode(wav_path, dest, tempo=None):
    """Nivela el volumen y codifica en Opus mono (poco peso; Chromium/Electron lo reproduce)."""
    filters = ["loudnorm=I=-18:TP=-2:LRA=7"]
    if tempo:
        filters.insert(0, f"atempo={tempo}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    run_ffmpeg("-i", str(wav_path), "-af", ",".join(filters), "-ac", "1", "-ar", "24000", "-c:a", "libopus", "-b:a", args.bitrate, str(dest))


def flush():
    out.mkdir(parents=True, exist_ok=True)
    tmp = index_path.with_suffix(".tmp")
    tmp.write_text(json.dumps(index, ensure_ascii=False, indent=1))
    tmp.replace(index_path)


if args.take is not None:
    if not (args.id or args.game):
        raise SystemExit("--take solo con --id o --game (para no cambiar la toma de todo sin querer).")
    # Con --take el id tiene que ser exacto (si no, «es/palabras/ala» también cambiaría «alacrán»)
    if args.id:
        items = [i for i in items if i["id"] in args.id]
        if not items:
            raise SystemExit("Con --take, --id tiene que ser el id completo (ej. es/palabras/ala).")
    for item in items:
        takes[item["id"]] = args.take
    TAKES_PATH.write_text(json.dumps(dict(sorted(takes.items())), ensure_ascii=False, indent=1) + "\n")
    args.force = True
    print(f"Toma {args.take} para {len(items)} audios (anotada en takes.json).")

todo = []
for item in items:
    files_ok = (out / f'{item["id"]}.opus').exists() and all(
        (out / f'{item["id"]}.{name}.opus').exists() for name in (item.get("variants") or [])
    )
    if args.force or index.get(item["id"], {}).get("hash") != fingerprint(item) or not files_ok:
        todo.append(item)
if args.limit:
    todo = todo[: args.limit]
print(f"{len(items)} audios en el manifiesto, {len(todo)} por generar.")

started = time.time()
done_count = 0


def save(item, x, sr):
    global done_count
    tmp = WORK / "_tmp.wav"
    sf.write(tmp, x, sr)
    encode(tmp, out / f'{item["id"]}.opus')
    files = [f'{item["id"]}.opus']
    for name in item.get("variants") or []:
        encode(tmp, out / f'{item["id"]}.{name}.opus', tempo=TEMPOS[name])
        files.append(f'{item["id"]}.{name}.opus')
    index[item["id"]] = {"hash": fingerprint(item), "text": item["text"], "lang": item["lang"], "seconds": round(len(x) / sr, 2), "files": files}
    done_count += 1
    if done_count % 25 == 0:
        flush()
        elapsed = time.time() - started
        print(f"[{done_count}/{len(todo)}] {elapsed / 60:.1f} min, faltan ~{elapsed / done_count * (len(todo) - done_count) / 60:.0f} min", flush=True)


# Los audios cortos (un solo bloque) van en lotes parecidos en largo; los largos, de a uno
short = [i for i in todo if "\n" not in i["text"] and len(i["text"]) <= BATCH_MAX_CHARS and not takes.get(i["id"])]
long_items = [i for i in todo if i not in short]
short.sort(key=lambda i: (i["lang"], len(i["text"])))
batches = []
for lang in sorted({i["lang"] for i in short}):
    group = [i for i in short if i["lang"] == lang]
    current, chars = [], 0
    for item in group:
        n = len(item["text"])
        if current and (len(current) >= BATCH or chars + n > BATCH_CHARS):
            batches.append(current)
            current, chars = [], 0
        current.append(item)
        chars += n
    if current:
        batches.append(current)

for batch in batches:
    results = synth_batch(batch)
    for item, result in zip(batch, results):
        x, sr = result if result is not None else synth(item)
        save(item, x, sr)
for item in long_items:
    x, sr = synth(item)
    save(item, x, sr)
    print(f"{item['id']}  {len(x) / sr:.1f} s de audio", flush=True)
flush()
shutil.rmtree(WORK, ignore_errors=True)
print(f"Listo en {(time.time() - started) / 60:.1f} min. {done_count} audios en {out}")
