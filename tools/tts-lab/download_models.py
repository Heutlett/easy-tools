"""Baja los modelos pesados (no se guardan en git). Se corre una sola vez, o cuando cambien las revisiones de common.py.

  .venv/bin/python download_models.py            # los dos modelos (~9 GB)
  .venv/bin/python download_models.py --only base
  .venv/bin/python download_models.py --check    # solo dice si ya están
"""
import argparse

from common import BASE, MODELS, VOICE_DESIGN

parser = argparse.ArgumentParser()
parser.add_argument("--only", choices=["design", "base"], help="design: para crear voces nuevas; base: para generar los audios")
parser.add_argument("--check", action="store_true", help="solo revisa si están descargados")
args = parser.parse_args()

wanted = {"design": VOICE_DESIGN, "base": BASE}
if args.only:
    wanted = {args.only: wanted[args.only]}

from huggingface_hub import snapshot_download  # noqa: E402  (después de fijar HF_HOME en common)

for name, (repo, revision) in wanted.items():
    try:
        path = snapshot_download(repo, revision=revision, local_files_only=True)
        print(f"✔ {name}: {repo} ya está en {path}")
        continue
    except Exception:
        if args.check:
            print(f"✘ {name}: {repo} NO está descargado")
            continue
    print(f"⬇ Bajando {repo} @ {revision[:8]} (unos 4.5 GB)…")
    path = snapshot_download(repo, revision=revision)
    print(f"✔ {name}: listo en {path}")

print(f"\nLos modelos viven en {MODELS} (ignorado por git).")
