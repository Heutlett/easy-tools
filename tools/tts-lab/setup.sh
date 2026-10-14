#!/usr/bin/env bash
# Prepara el entorno de Python del laboratorio de voces (una sola vez).
# Requisitos: uv (https://docs.astral.sh/uv/), una tarjeta NVIDIA con unos 8 GB de memoria de video y espacio en disco (~15 GB).
#   TORCH_INDEX=https://download.pytorch.org/whl/cu128   (por defecto: CUDA 12.8, la que necesitan las RTX 50)
set -euo pipefail
cd "$(dirname "$0")"
INDEX="${TORCH_INDEX:-https://download.pytorch.org/whl/cu128}"
uv venv --python 3.12 .venv
# PyTorch primero, con la versión de CUDA que corresponde; después lo demás (si no, pip elige otra versión de torch)
uv pip install --python .venv/bin/python torch torchaudio --index-url "$INDEX"
uv pip install --python .venv/bin/python -r requirements.txt
.venv/bin/python - <<'PY'
import torch
print("torch", torch.__version__, "| CUDA", torch.version.cuda, "| GPU:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "NO HAY")
PY
echo "Listo. Siguiente paso: .venv/bin/python download_models.py"
