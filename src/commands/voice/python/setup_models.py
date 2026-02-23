"""Download and prepare all required voice models."""

import os
import sys

from logger import log


def get_models_dir() -> str:
    return os.environ.get(
        "VOICE_MODELS_DIR",
        os.path.expanduser("~/.assist/voice/models"),
    )


def setup_silero_vad(models_dir: str) -> None:
    target = os.path.join(models_dir, "silero_vad.onnx")
    if os.path.exists(target):
        print("  silero_vad.onnx already exists")
        return

    print("  Downloading Silero VAD ONNX model...")
    import urllib.request

    url = "https://github.com/snakers4/silero-vad/raw/master/src/silero_vad/data/silero_vad.onnx"
    urllib.request.urlretrieve(url, target)
    log("setup_vad", f"Downloaded to {target}")
    print("  silero_vad.onnx downloaded")


def setup_smart_turn(models_dir: str) -> None:
    target = os.path.join(models_dir, "smart-turn-v3.2-cpu.onnx")
    if os.path.exists(target):
        print("  smart-turn-v3.2-cpu.onnx already exists")
        return

    print("  Downloading Smart Turn ONNX model from HuggingFace...")
    from huggingface_hub import hf_hub_download

    path = hf_hub_download(
        repo_id="pipecat-ai/smart-turn-v3",
        filename="smart-turn-v3.2-cpu.onnx",
        local_dir=models_dir,
    )
    log("setup_smart_turn", f"Downloaded to {path}")
    print("  smart-turn-v3.2-cpu.onnx downloaded")


def setup_stt(models_dir: str) -> None:
    model_name = os.environ.get("VOICE_MODEL_STT", "nvidia/parakeet-ctc-1.1b")
    print(f"  Downloading STT model: {model_name}...")
    print("  (this may take a while on first run)")

    import nemo.collections.asr as nemo_asr

    nemo_asr.models.EncDecCTCModelBPE.from_pretrained(model_name)
    log("setup_stt", f"Model ready: {model_name}")
    print(f"  STT model ready: {model_name}")


def main() -> None:
    models_dir = get_models_dir()
    os.makedirs(models_dir, exist_ok=True)
    print(f"Models directory: {models_dir}\n")

    print("[1/3] Silero VAD")
    try:
        setup_silero_vad(models_dir)
    except Exception as e:
        log("setup_vad_error", str(e), level="error")
        print(f"  ERROR: {e}", file=sys.stderr)

    print("\n[2/3] Smart Turn (pipecat-ai)")
    try:
        setup_smart_turn(models_dir)
    except Exception as e:
        log("setup_smart_turn_error", str(e), level="error")
        print(f"  ERROR: {e}", file=sys.stderr)

    print("\n[3/3] Parakeet STT (NeMo)")
    try:
        setup_stt(models_dir)
    except Exception as e:
        log("setup_stt_error", str(e), level="error")
        print(f"  ERROR: {e}", file=sys.stderr)

    print("\nSetup complete.")


if __name__ == "__main__":
    main()
