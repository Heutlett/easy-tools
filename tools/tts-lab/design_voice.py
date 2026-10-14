"""Crea (o cambia) la voz fija de un idioma. Todos los audios de ese idioma se generan CLONANDO esta voz, así suenan igual
aunque se generen en días distintos. Se corre pocas veces: solo si se quiere otra voz.

  # 1) Genera varias candidatas para escucharlas (candidates/es-seed7.wav …)
  .venv/bin/python design_voice.py es --seeds 7,8,9,10
  # 2) Elige una y queda como la voz (voices/es/ref.wav + voice.json, que sí van a git)
  .venv/bin/python design_voice.py es --accept 7

Para cambiar cómo suena, edita la descripción (`instruct`) en DEFAULTS o pásala con --instruct.
Si se cambia la voz hay que volver a generar TODOS los audios del idioma (generate.py --force --lang es).
"""
import argparse
import json
import shutil

import numpy as np
import soundfile as sf
import torch

from common import LANGUAGE_NAME, ROOT, VOICE_DESIGN, load_model

DEFAULTS = {
    "es": {
        "instruct": (
            "A warm, calm adult male voice with a neutral Latin American Spanish accent, like a kind primary-school teacher "
            "reading aloud to children. Clear articulation, slow and steady pace, natural pauses."
        ),
        "text": (
            "Hola, niños. Hoy vamos a leer juntos un cuento muy bonito. Escuchen con atención, "
            "y después contestaremos unas preguntas."
        ),
    },
    "en": {
        "instruct": (
            "A warm, friendly adult female voice with a clear American English accent, like an elementary-school English teacher "
            "speaking to young learners. Clear articulation, slow and steady pace."
        ),
        "text": (
            "Hello, kids. Today we are going to read a story together. Listen carefully, "
            "and then we will answer some questions."
        ),
    },
}

parser = argparse.ArgumentParser()
parser.add_argument("lang", choices=sorted(DEFAULTS))
parser.add_argument("--seeds", help="semillas a probar, separadas por comas (cada una da una voz distinta)")
parser.add_argument("--accept", type=int, help="semilla de la candidata que queda como la voz")
parser.add_argument("--instruct", help="descripción de la voz (por defecto la de DEFAULTS)")
parser.add_argument("--text", help="texto de referencia (por defecto el de DEFAULTS)")
args = parser.parse_args()

cfg = DEFAULTS[args.lang]
instruct = args.instruct or cfg["instruct"]
text = args.text or cfg["text"]
candidates = ROOT / "candidates"
candidates.mkdir(exist_ok=True)

if args.seeds:
    model = load_model(VOICE_DESIGN)
    for seed in [int(s) for s in args.seeds.split(",")]:
        torch.manual_seed(seed)
        wavs, sr = model.generate_voice_design(text=text, language=LANGUAGE_NAME[args.lang], instruct=instruct)
        path = candidates / f"{args.lang}-seed{seed}.wav"
        sf.write(path, np.asarray(wavs[0], dtype=np.float32), sr)
        print(f"{path.relative_to(ROOT)}  ({len(wavs[0]) / sr:.1f} s)")
    print("Escúchalas y elige con --accept SEMILLA")

if args.accept is not None:
    src = candidates / f"{args.lang}-seed{args.accept}.wav"
    if not src.exists():
        raise SystemExit(f"No existe {src}: primero genera la candidata con --seeds {args.accept}")
    dest = ROOT / "voices" / args.lang
    dest.mkdir(parents=True, exist_ok=True)
    shutil.copy(src, dest / "ref.wav")
    (dest / "voice.json").write_text(
        json.dumps(
            {"lang": args.lang, "seed": args.accept, "instruct": instruct, "text": text, "designedWith": "%s@%s" % VOICE_DESIGN},
            ensure_ascii=False,
            indent=2,
        )
        + "\n"
    )
    print(f"✔ La voz de «{args.lang}» quedó en voices/{args.lang}/ (ref.wav + voice.json). Haz commit de esos dos archivos.")
