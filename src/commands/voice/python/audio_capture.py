"""Microphone capture via sounddevice (16kHz PCM)."""

import os
import queue
import numpy as np
import sounddevice as sd

from logger import log

SAMPLE_RATE = 16000
BLOCK_SIZE = 512  # Silero VAD requires exactly 512 samples at 16kHz


class AudioCapture:
    def __init__(self):
        self._queue: queue.Queue[np.ndarray] = queue.Queue()
        self._stream: sd.InputStream | None = None
        device_name = os.environ.get("VOICE_MIC")
        self._device = device_name if device_name else None

    def _callback(self, indata: np.ndarray, frames: int, time_info, status) -> None:
        if status:
            log("audio_status", str(status), level="warn")
        self._queue.put(indata[:, 0].copy())

    def start(self) -> None:
        log(
            "audio_start",
            f"device={self._device}, rate={SAMPLE_RATE}, block={BLOCK_SIZE}",
        )
        self._stream = sd.InputStream(
            samplerate=SAMPLE_RATE,
            channels=1,
            dtype="float32",
            blocksize=BLOCK_SIZE,
            device=self._device,
            callback=self._callback,
        )
        self._stream.start()

    def read(self, timeout: float = 1.0) -> np.ndarray | None:
        try:
            return self._queue.get(timeout=timeout)
        except queue.Empty:
            return None

    def stop(self) -> None:
        if self._stream:
            self._stream.stop()
            self._stream.close()
            self._stream = None
            log("audio_stop")
