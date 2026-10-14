"""Lo que comparten los scripts del laboratorio de voces: rutas, modelos y utilidades de audio."""
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
MODELS = ROOT / "models"
# Los modelos se guardan dentro del laboratorio (carpeta ignorada por git), no en ~/.cache
os.environ.setdefault("HF_HOME", str(MODELS / "hf"))
# Menos fragmentación de la memoria de video: con 8 GB cada megabyte cuenta
os.environ.setdefault("PYTORCH_CUDA_ALLOC_CONF", "expandable_segments:True")

# Revisiones fijas: así los audios nuevos suenan igual que los anteriores aunque el modelo se actualice
VOICE_DESIGN = ("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", "5ecdb67327fd37bb2e042aab12ff7391903235d3")
BASE = ("Qwen/Qwen3-TTS-12Hz-1.7B-Base", "fd4b254389122332181a7c3db7f27e918eec64e3")
LANGUAGE_NAME = {"es": "Spanish", "en": "English"}
SAMPLE_RATE = 24000


def load_model(which):
    """Carga uno de los dos modelos en la tarjeta de video (unos 5 GB)."""
    import torch
    from qwen_tts import Qwen3TTSModel

    repo, revision = which
    return Qwen3TTSModel.from_pretrained(
        repo, revision=revision, device_map="cuda:0", dtype=torch.bfloat16, attn_implementation="sdpa"
    )


def ffmpeg():
    """ffmpeg: el del sistema o el que baja `npm run setup` en resources/bin."""
    found = shutil.which("ffmpeg")
    if found:
        return found
    for sub in ("linux", "mac", "win"):
        for name in ("ffmpeg", "ffmpeg.exe"):
            candidate = REPO / "resources" / "bin" / sub / name
            if candidate.exists():
                return str(candidate)
    sys.exit("No encuentro ffmpeg. Instálalo o corre `npm run setup` en la raíz del repositorio.")


def run_ffmpeg(*args):
    subprocess.run([ffmpeg(), "-y", "-loglevel", "error", *args], check=True)
