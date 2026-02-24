"""Voice daemon entry point — main loop and signal handling."""

import ctypes
import json
import os
import signal
import subprocess
import sys
import time

import numpy as np

from audio_capture import AudioCapture, BLOCK_SIZE
from logger import DEBUG, log
from smart_turn import SmartTurn
from stt import ParakeetSTT
from vad import SileroVAD
from wake_word import check_wake_word

import keyboard


def _load_voice_config() -> dict:
    """Load voice config by calling ``assist config get voice``.

    Sets environment variables so other Python modules (audio_capture,
    vad, smart_turn, stt, wake_word) can read them as before.
    Returns the parsed config dict.
    """
    try:
        result = subprocess.run(
            ["assist", "config", "get", "voice"],
            capture_output=True,
            text=True,
            check=True,
            shell=True,
        )
        config = json.loads(result.stdout)
    except (subprocess.CalledProcessError, json.JSONDecodeError) as exc:
        log("config_error", str(exc), level="error")
        return {}

    env_map: dict[str, str | None] = {
        "VOICE_WAKE_WORDS": ",".join(config.get("wakeWords", [])) or None,
        "VOICE_MIC": config.get("mic"),
        "VOICE_MODELS_DIR": os.path.expanduser(v)
        if (v := config.get("modelsDir"))
        else None,
        "VOICE_MODEL_VAD": (config.get("models") or {}).get("vad"),
        "VOICE_MODEL_SMART_TURN": (config.get("models") or {}).get("smartTurn"),
    }
    for key, value in env_map.items():
        if value:
            os.environ[key] = value

    log("config_loaded", json.dumps(config))
    return config


def _get_foreground_window_info() -> str:
    """Return the title and process name of the currently focused window."""
    user32 = ctypes.windll.user32
    kernel32 = ctypes.windll.kernel32
    hwnd = user32.GetForegroundWindow()

    # Window title
    buf = ctypes.create_unicode_buffer(256)
    user32.GetWindowTextW(hwnd, buf, 256)
    title = buf.value

    # Process name from window handle
    pid = ctypes.c_ulong()
    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
    process_name = ""
    PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
    handle = kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, False, pid.value)
    if handle:
        exe_buf = ctypes.create_unicode_buffer(260)
        size = ctypes.c_ulong(260)
        if kernel32.QueryFullProcessImageNameW(handle, 0, exe_buf, ctypes.byref(size)):
            process_name = exe_buf.value.rsplit("\\", 1)[-1]
        kernel32.CloseHandle(handle)

    if process_name:
        return f"{process_name}: {title}"
    return title


# States
IDLE = "idle"
LISTENING = "listening"
ACTIVATED = "activated"  # wake word heard (alone), waiting for command utterance

# Max seconds of speech before forced processing
MAX_SPEECH_SECONDS = 30

# How often (in samples) to run partial STT during speech
PARTIAL_STT_INTERVAL = 16000  # every 1 second of audio

# Trailing silence (in ms) required before sending segment to smart turn.
# Matches the reference implementation (record_and_predict.py STOP_MS=1000).
STOP_MS = 1000
STOP_CHUNKS = (STOP_MS * 16000) // (BLOCK_SIZE * 1000)  # ~31 chunks

# How long (seconds) to wait for a command after a wake-word-only utterance
ACTIVATED_TIMEOUT = 10.0


def _print_state(state: str) -> None:
    """Print the current daemon state to stderr when debug mode is on."""
    print(f"\r  {state:10s}", end="", file=sys.stderr, flush=True)


class VoiceDaemon:
    def __init__(self):
        self._running = True
        self._state = IDLE
        self._audio_buffer: list[np.ndarray] = []

        config = _load_voice_config()
        self._submit_windows: set[str] = set(config.get("submitWindows") or [])

        log("daemon_init", "Initializing models...")
        self._mic = AudioCapture()
        self._vad = SileroVAD()
        self._smart_turn = SmartTurn()
        self._stt = ParakeetSTT()
        if self._submit_windows:
            log("daemon_init", f"Submit windows: {self._submit_windows}")
        log("daemon_ready")

        # Incremental typing state
        self._wake_detected = False
        self._typed_text = ""
        self._last_partial_at = 0
        self._activated_at = 0.0

    def _handle_signal(self, signum, frame) -> None:
        log("daemon_signal", f"Received signal {signum}")
        self._running = False

    def _run_partial_stt(self) -> None:
        """Run STT on accumulated audio and type incrementally."""
        if not self._audio_buffer:
            return

        audio = np.concatenate(self._audio_buffer)
        text = self._stt.transcribe(audio)
        if not text.strip():
            return

        if DEBUG:
            print(f"\n  Partial: {text}", file=sys.stderr)

        if self._state == ACTIVATED:
            # Already activated — everything is the command, no wake word needed
            partial = text.strip()
            if partial and partial != self._typed_text:
                if self._typed_text:
                    self._update_typed_text(partial)
                else:
                    keyboard.type_text(partial)
                    self._typed_text = partial
        elif not self._wake_detected:
            found, command = check_wake_word(text)
            if found and command:
                self._wake_detected = True
                log("wake_word_detected", command)
                if DEBUG:
                    print(f"  Wake word! Typing: {command}", file=sys.stderr)
                keyboard.type_text(command)
                self._typed_text = command
        else:
            found, command = check_wake_word(text)
            if found and command:
                if command != self._typed_text:
                    self._update_typed_text(command)

    def _should_submit(self) -> bool:
        """Check if the foreground window matches the submit allowlist."""
        if not self._submit_windows:
            return True
        info = _get_foreground_window_info()
        process_name = info.split(":")[0].strip() if ":" in info else ""
        return process_name in self._submit_windows

    def _update_typed_text(self, new_text: str) -> None:
        """Diff old typed text vs new at word level, minimising deletions.

        Only deletes back to the first word that changed; appends everything
        after the common word prefix.  This avoids the jarring full-delete
        that character-level diffing causes when earlier words shift slightly.
        """
        old = self._typed_text
        if old == new_text:
            return

        old_words = old.split()
        new_words = new_text.split()

        # Find the longest common word prefix
        common_words = 0
        for a, b in zip(old_words, new_words):
            if a == b:
                common_words += 1
            else:
                break

        # Character position where the common word prefix ends (including
        # the trailing space after the last common word, if any).
        if common_words == 0:
            keep_chars = 0
        else:
            # Rejoin the common words and add one space (the separator before
            # the next word that was already typed).
            keep = " ".join(old_words[:common_words])
            # Only count the trailing space if there were more old words after
            # the common prefix (meaning that space is already on screen).
            if common_words < len(old_words):
                keep_chars = len(keep) + 1  # +1 for the space
            else:
                keep_chars = len(keep)

        to_delete = len(old) - keep_chars
        if to_delete > 0:
            keyboard.backspace(to_delete)

        # Build the new suffix to type from the first divergent word onward
        if common_words == 0:
            to_type = new_text
        else:
            suffix = " ".join(new_words[common_words:])
            if suffix:
                # Need a space separator if we kept text and are appending
                if keep_chars > 0 and common_words < len(old_words):
                    to_type = suffix
                elif keep_chars > 0:
                    to_type = " " + suffix
                else:
                    to_type = suffix
            else:
                to_type = ""

        if to_type:
            keyboard.type_text(to_type)
        self._typed_text = new_text

    def _process_audio_chunk(
        self, chunk, prob: float, sample_count: int, trailing_silence: int
    ) -> tuple[int, int]:
        """Buffer audio chunk, run partial STT, and check for segment end."""
        self._audio_buffer.append(chunk)
        sample_count += len(chunk)

        if prob > self._vad.threshold:
            trailing_silence = 0
        else:
            trailing_silence += 1

        if sample_count - self._last_partial_at >= PARTIAL_STT_INTERVAL:
            self._last_partial_at = sample_count
            self._run_partial_stt()

        is_end, reset_silence = self._check_segment_end(sample_count, trailing_silence)
        if is_end:
            self._finalize_utterance()
            sample_count = 0
            trailing_silence = 0
        elif reset_silence:
            trailing_silence = 0

        return sample_count, trailing_silence

    def _check_segment_end(
        self, sample_count: int, trailing_silence: int
    ) -> tuple[bool, bool]:
        """Check if the current segment is done.

        Follows the reference smart-turn implementation:
        1. Accumulate speech + trailing silence.
        2. After STOP_MS of continuous silence, send the full segment to smart turn.
        3. If smart turn says "Incomplete", keep listening.
        4. If smart turn says "Complete", finalize.
        5. Hard cap at MAX_SPEECH_SECONDS always finalizes.

        Returns (is_end, reset_silence).  When reset_silence is True the caller
        must zero trailing_silence so that another full STOP_MS of silence is
        required before re-checking smart turn.
        """
        max_samples = MAX_SPEECH_SECONDS * 16000

        if sample_count >= max_samples:
            log("max_speech", "Reached max speech duration")
            return True, False

        if trailing_silence >= STOP_CHUNKS:
            audio_so_far = np.concatenate(self._audio_buffer)
            is_complete = self._smart_turn.is_end_of_turn(audio_so_far)
            if DEBUG:
                label = "Complete" if is_complete else "Incomplete"
                print(f"\n  Smart turn: {label}", file=sys.stderr)
            if is_complete:
                return True, False
            else:
                log("smart_turn_incomplete", "Continuing to listen...")
                return False, True
        return False, False

    def _dispatch_result(self, text: str) -> None:
        """Log and optionally submit a recognized command."""
        should_submit = self._should_submit()
        if should_submit:
            log("dispatch_enter", text)
            if DEBUG:
                print(f"  Final: {text} [Enter]", file=sys.stderr)
            keyboard.press_enter()
        else:
            log("dispatch_typed", text)
            if DEBUG:
                print(f"  Final: {text} (no submit)", file=sys.stderr)

    def _finalize_utterance(self) -> None:
        """End of turn: final STT, correct typed text, press Enter."""
        if not self._audio_buffer:
            self._reset_listening()
            return

        audio = np.concatenate(self._audio_buffer)
        duration = len(audio) / 16000
        log("end_of_turn", f"audio_length={duration:.1f}s")

        if DEBUG:
            print(file=sys.stderr)

        text = self._stt.transcribe(audio)

        if self._state == ACTIVATED:
            self._finalize_activated_command(text)
            self._reset_listening()
            return

        if self._wake_detected:
            self._finalize_streamed_wake_word(text)
        elif not self._finalize_check_final_text(text):
            return  # entered ACTIVATED state, don't reset to IDLE

        self._reset_listening()

    def _finalize_activated_command(self, text: str) -> None:
        """Finalize utterance in ACTIVATED state (full text is the command)."""
        command = text.strip()
        if command:
            if command != self._typed_text:
                if self._typed_text:
                    self._update_typed_text(command)
                else:
                    keyboard.type_text(command)
            self._dispatch_result(command)
        else:
            if self._typed_text:
                keyboard.backspace(len(self._typed_text))
            log("dispatch_cancelled", "Empty command in activated mode")

    def _finalize_streamed_wake_word(self, text: str) -> None:
        """Finalize when wake word was detected during streaming."""
        found, command = check_wake_word(text)
        if found and command:
            if command != self._typed_text:
                self._update_typed_text(command)
            self._dispatch_result(command)
        elif found:
            if self._typed_text:
                keyboard.backspace(len(self._typed_text))
            log("dispatch_cancelled", "No command after wake word")
        elif self._typed_text:
            # Final transcription lost the wake word (e.g. audio clipping
            # turned "computer" into "uter"); fall back to the command
            # captured during streaming
            self._dispatch_result(self._typed_text)

    def _finalize_check_final_text(self, text: str) -> bool:
        """Check final transcription for wake word.

        Returns True if caller should reset to IDLE, False if entering ACTIVATED.
        """
        found, command = check_wake_word(text)
        if found and command:
            log("wake_word_detected", command)
            if DEBUG:
                print(f"  Wake word! Final: {command}", file=sys.stderr)
            keyboard.type_text(command)
            self._dispatch_result(command)
        if found and not command:
            # Wake word only — enter ACTIVATED state for next utterance
            log("wake_word_only", "Listening for command...")
            if DEBUG:
                print("  Wake word heard — listening for command...", file=sys.stderr)
            self._audio_buffer.clear()
            self._vad.reset()
            self._wake_detected = False
            self._typed_text = ""
            self._last_partial_at = 0
            self._activated_at = time.monotonic()
            self._state = ACTIVATED
            return False
        elif not found:
            log("no_wake_word", text)
            if DEBUG:
                print(f"  No wake word: {text}", file=sys.stderr)
        return True

    def _reset_listening(self) -> None:
        self._audio_buffer.clear()
        self._vad.reset()
        self._wake_detected = False
        self._typed_text = ""
        self._last_partial_at = 0
        self._activated_at = 0.0
        self._state = IDLE

    def _check_activated_timeout(self) -> bool:
        """If in ACTIVATED state with no audio buffered, check for timeout.

        Returns True if timed out and state was reset.
        """
        if self._state != ACTIVATED or self._audio_buffer:
            return False
        if time.monotonic() - self._activated_at <= ACTIVATED_TIMEOUT:
            return False
        log("activated_timeout", "No command received")
        if DEBUG:
            print("\n  Activation timed out", file=sys.stderr)
        self._reset_listening()
        return True

    def run(self) -> None:
        signal.signal(signal.SIGTERM, self._handle_signal)
        signal.signal(signal.SIGINT, self._handle_signal)

        log("daemon_start", "Starting audio capture...")
        self._mic.start()

        if DEBUG:
            print("Listening... (Ctrl+C to stop)", file=sys.stderr)

        sample_count = 0
        trailing_silence = 0

        try:
            while self._running:
                chunk = self._mic.read(timeout=0.5)
                if chunk is None:
                    self._check_activated_timeout()
                    continue

                prob = self._vad.process(chunk)

                if DEBUG:
                    _print_state(self._state)

                if self._state == IDLE:
                    if prob > self._vad.threshold:
                        log("speech_start")
                        self._state = LISTENING
                        self._audio_buffer.append(chunk)
                        sample_count = len(chunk)
                        trailing_silence = 0
                        self._last_partial_at = 0

                elif self._state == ACTIVATED:
                    if self._check_activated_timeout():
                        continue

                    if prob > self._vad.threshold and not self._audio_buffer:
                        log("speech_start", "command after activation")

                    if prob > self._vad.threshold or self._audio_buffer:
                        sample_count, trailing_silence = self._process_audio_chunk(
                            chunk, prob, sample_count, trailing_silence
                        )

                elif self._state == LISTENING:
                    sample_count, trailing_silence = self._process_audio_chunk(
                        chunk, prob, sample_count, trailing_silence
                    )

        finally:
            if DEBUG:
                print(file=sys.stderr)
            self._mic.stop()
            log("daemon_stop", "Voice daemon stopped")


def _setup_console() -> None:
    """On Windows, reopen stdout/stderr to the process's own console (CONOUT$).

    When launched as a detached background process, Node.js redirects stdio to
    NUL.  Windows still allocates a console window for the process, but nothing
    appears in it.  Opening CONOUT$ gives us a handle to that console so all
    debug output shows up there.
    """
    if sys.platform != "win32":
        return
    try:
        con = open("CONOUT$", "w", encoding="utf-8")
        sys.stdout = con
        sys.stderr = con
    except OSError:
        pass


def main() -> None:
    _setup_console()
    log("daemon_launch", f"PID={os.getpid()}")
    try:
        daemon = VoiceDaemon()
        daemon.run()
    except Exception as e:
        log("daemon_crash", str(e), level="error")
        if DEBUG:
            import traceback

            traceback.print_exc(file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
