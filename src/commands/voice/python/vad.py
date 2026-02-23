"""Silero VAD wrapper (ONNX)."""

import os

import numpy as np
import onnxruntime as ort

from logger import log

DEFAULT_THRESHOLD = 0.5
CONTEXT_SIZE = 64  # v5/v6 requires 64 context samples prepended at 16kHz


class SileroVAD:
    def __init__(self):
        model_path = os.environ.get("VOICE_MODEL_VAD")
        if not model_path:
            models_dir = os.environ.get(
                "VOICE_MODELS_DIR",
                os.path.expanduser("~/.assist/voice/models"),
            )
            model_path = os.path.join(models_dir, "silero_vad.onnx")

        log("vad_init", f"model={model_path}")
        self._session = ort.InferenceSession(
            model_path, providers=["CPUExecutionProvider"]
        )
        self._state = np.zeros((2, 1, 128), dtype=np.float32)
        self._context = np.zeros(CONTEXT_SIZE, dtype=np.float32)
        self._sample_rate = np.array(16000, dtype=np.int64)
        self.threshold = DEFAULT_THRESHOLD

    def process(self, audio: np.ndarray) -> float:
        """Process a chunk of audio, return speech probability."""
        chunk = audio.astype(np.float32)
        # Prepend context (last 64 samples from previous chunk)
        input_data = np.concatenate([self._context, chunk]).reshape(1, -1)
        ort_inputs = {
            "input": input_data,
            "state": self._state,
            "sr": self._sample_rate,
        }
        out, state = self._session.run(None, ort_inputs)
        self._state = state
        self._context = chunk[-CONTEXT_SIZE:]
        return float(out[0][0])

    def reset(self) -> None:
        self._state = np.zeros((2, 1, 128), dtype=np.float32)
        self._context = np.zeros(CONTEXT_SIZE, dtype=np.float32)
