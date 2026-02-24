"""Parakeet NeMo STT wrapper (GPU)."""

import os
import numpy as np
import torch

from logger import log

DEFAULT_MODEL = "nvidia/parakeet-ctc-1.1b"


class ParakeetSTT:
    def __init__(self):
        model_name = os.environ.get("VOICE_MODEL_STT", DEFAULT_MODEL)
        self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        log("stt_init", f"model={model_name} device={self._device}")

        import nemo.collections.asr as nemo_asr

        self._model = nemo_asr.models.EncDecCTCModelBPE.from_pretrained(model_name)
        self._model = self._model.to(self._device)
        self._model.eval()
        log("stt_ready")

    def transcribe(self, audio: np.ndarray, sample_rate: int = 16000) -> str:
        """Transcribe audio buffer to text via direct forward pass."""
        audio_tensor = (
            torch.tensor(audio, dtype=torch.float32).unsqueeze(0).to(self._device)
        )
        audio_len = torch.tensor([audio.shape[0]], dtype=torch.long).to(self._device)

        with torch.no_grad():
            logits, logits_len, _ = self._model.forward(
                input_signal=audio_tensor, input_signal_length=audio_len
            )
            # Greedy CTC decode
            preds = torch.argmax(logits, dim=-1)
            text = self._model.decoding.ctc_decoder_predictions_tensor(
                preds, decoder_lengths=logits_len
            )

        # Result may be nested: tuple of lists of Hypothesis objects
        if isinstance(text, tuple):
            text = text[0]
        if isinstance(text, list):
            text = text[0]
        # NeMo returns Hypothesis namedtuples with a .text field
        if hasattr(text, "text"):
            text = text.text
        if not isinstance(text, str):
            text = str(text)

        log("stt_result", text)
        return text
