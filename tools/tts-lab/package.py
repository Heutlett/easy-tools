"""Empaqueta los audios de out/ en un solo .zip para publicarlo y que la app lo descargue (como las demás piezas grandes).

  .venv/bin/python package.py            # (o con cualquier Python 3; no necesita GPU) crea dist/Educando-voces-<versión>.zip

El zip va SIN comprimir (los .opus ya están comprimidos) y trae out/index.json (el catálogo) en la raíz. Al final imprime el tamaño y el
SHA-256 que hay que poner en src/shared/voices.ts. Para publicarlo: subir el .zip como archivo de un release en GitHub (ver README).
"""
import argparse
import hashlib
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument("--out", default=str(ROOT / "out"))
parser.add_argument("--version", type=int, default=1, help="número de la versión del paquete (súbelo si cambian los audios)")
args = parser.parse_args()

out = Path(args.out)
index = json.load(open(out / "index.json"))
manifest = {i["id"] for i in json.load(open(ROOT / "manifest.json"))} if (ROOT / "manifest.json").exists() else set(index)
# Solo viaja lo que está en el manifiesto de hoy (los audios viejos que quedaron en out/ no)
keep = {k: v for k, v in index.items() if k in manifest}
files = sorted(f for v in keep.values() for f in v["files"])
missing = [f for f in files if not (out / f).exists()]
if missing:
    raise SystemExit(f"Faltan {len(missing)} archivos de audio (ej. {missing[0]}). Corre generate.py primero.")

dist = ROOT / "dist"
dist.mkdir(exist_ok=True)
target = dist / f"Educando-voces-{args.version}.zip"
with zipfile.ZipFile(target, "w", zipfile.ZIP_STORED) as z:
    z.writestr("index.json", json.dumps(keep, ensure_ascii=False, separators=(",", ":")))
    for f in files:
        z.write(out / f, f)

sha = hashlib.sha256()
with open(target, "rb") as fh:
    for chunk in iter(lambda: fh.read(1 << 20), b""):
        sha.update(chunk)
size = target.stat().st_size
print(f"{target.relative_to(ROOT)}: {len(keep)} audios, {len(files)} archivos, {size / 1048576:.1f} MB")
print("\nPega esto en src/shared/voices.ts (VOICES_PACK):")
print(f"  version: {args.version},\n  sha256: '{sha.hexdigest()}',\n  sizeMB: {round(size / 1048576)}")
print(f"\nY sube {target.name} como archivo del release «voces-{args.version}» (ver tools/tts-lab/README.md).")
