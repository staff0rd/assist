"""Smart Turn end-of-utterance detection (ONNX) via pipecat-ai/smart-turn."""

import os

import numpy as np
import onnxruntime as ort
from transformers import WhisperFeatureExtractor

from logger import log

END_THRESHOLD = 0.5
CHUNK_SECONDS = 8
SAMPLE_RATE = 16000


def _truncate_or_pad(audio: np.ndarray) -> np.ndarray:
    max_samples = CHUNK_SECONDS * SAMPLE_RATE
    if len(audio) > max_samples:
        return audio[-max_samples:]
    if len(audio) < max_samples:
        padding = max_samples - len(audio)
        return np.pad(audio, (padding, 0), mode="constant", constant_values=0)
    return audio


class SmartTurn:
    def __init__(self):
        model_path = os.environ.get("VOICE_MODEL_SMART_TURN")
        if not model_path:
            models_dir = os.environ.get(
                "VOICE_MODELS_DIR",
                os.path.expanduser("~/.assist/voice/models"),
            )
            model_path = os.path.join(models_dir, "smart-turn-v3.2-cpu.onnx")

        log("smart_turn_init", f"model={model_path}")
        so = ort.SessionOptions()
        so.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
        so.inter_op_num_threads = 1
        so.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        self._session = ort.InferenceSession(
            model_path, sess_options=so, providers=["CPUExecutionProvider"]
        )
        self._feature_extractor = WhisperFeatureExtractor(chunk_length=CHUNK_SECONDS)
        self.threshold = END_THRESHOLD

    def is_end_of_turn(self, audio: np.ndarray) -> bool:
        """Check if the accumulated audio indicates end of utterance."""
        audio = _truncate_or_pad(audio)
        inputs = self._feature_extractor(
            audio,
            sampling_rate=SAMPLE_RATE,
            return_tensors="np",
            padding="max_length",
            max_length=CHUNK_SECONDS * SAMPLE_RATE,
            truncation=True,
            do_normalize=True,
        )
        features = inputs.input_features.squeeze(0).astype(np.float32)
        features = np.expand_dims(features, axis=0)
        outputs = self._session.run(None, {"input_features": features})
        prob = float(outputs[0][0].item())
        return prob > self.threshold
