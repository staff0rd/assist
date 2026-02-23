"""Voice daemon entry point — main loop and signal handling."""

import os
import signal
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


def _print_vad_bar(
    prob: float, threshold: float, state: str, chunk: np.ndarray
) -> None:
    """Print a live VAD meter to stderr when debug mode is on."""
    rms = float(np.sqrt(np.mean(chunk**2)))
    peak = float(np.max(np.abs(chunk)))
    width = 40
    filled = int(prob * width)
    bar = "█" * filled + "░" * (width - filled)
    marker = ">" if prob > threshold else " "
    print(
        f"\r  {marker} VAD {prob:.2f} [{bar}] "
        f"rms={rms:.4f} peak={peak:.4f} {state:10s}",
        end="",
        file=sys.stderr,
        flush=True,
    )


class VoiceDaemon:
    def __init__(self):
        self._running = True
        self._state = IDLE
        self._audio_buffer: list[np.ndarray] = []
        self._submit_word = os.environ.get("VOICE_SUBMIT_WORD", "").strip().lower()

        log("daemon_init", "Initializing models...")
        self._mic = AudioCapture()
        self._vad = SileroVAD()
        self._smart_turn = SmartTurn()
        self._stt = ParakeetSTT()
        if self._submit_word:
            log("daemon_init", f"Submit word: '{self._submit_word}'")
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
            partial = self._hide_submit_word(text.strip())
            if partial and partial != self._typed_text:
                if self._typed_text:
                    self._update_typed_text(partial)
                else:
                    keyboard.type_text(partial)
                    self._typed_text = partial
        elif not self._wake_detected:
            found, command = check_wake_word(text)
            if found and command:
                partial = self._hide_submit_word(command)
                if partial:
                    self._wake_detected = True
                    log("wake_word_detected", partial)
                    if DEBUG:
                        print(f"  Wake word! Typing: {partial}", file=sys.stderr)
                    keyboard.type_text(partial)
                    self._typed_text = partial
        else:
            found, command = check_wake_word(text)
            if found and command:
                partial = self._hide_submit_word(command)
                if partial and partial != self._typed_text:
                    self._update_typed_text(partial)

    def _strip_submit_word(self, text: str) -> tuple[bool, str]:
        """Check if text ends with the submit word.

        Returns (should_submit, stripped_text).
        If no submit word is configured, always returns (True, text).
        """
        if not self._submit_word:
            return True, text
        words = text.rsplit(None, 1)
        if len(words) >= 1 and words[-1].lower().rstrip(".,!?") == self._submit_word:
            stripped = text[: text.lower().rfind(words[-1].lower())].rstrip()
            return True, stripped
        return False, text

    def _hide_submit_word(self, text: str) -> str:
        """Strip trailing submit word from partial text so it's never typed."""
        if not self._submit_word:
            return text
        _, stripped = self._strip_submit_word(text)
        return stripped

    def _update_typed_text(self, new_text: str) -> None:
        """Diff old typed text vs new, backspace + type the difference."""
        old = self._typed_text
        # Find common prefix
        common = 0
        for a, b in zip(old, new_text):
            if a == b:
                common += 1
            else:
                break
        # Backspace what's wrong, type new suffix
        to_delete = len(old) - common
        to_type = new_text[common:]
        if to_delete > 0:
            keyboard.backspace(to_delete)
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

        if self._check_segment_end(sample_count, trailing_silence):
            self._finalize_utterance()
            sample_count = 0
            trailing_silence = 0

        return sample_count, trailing_silence

    def _check_segment_end(self, sample_count: int, trailing_silence: int) -> bool:
        """Check if the current segment is done.

        Follows the reference smart-turn implementation:
        1. Accumulate speech + trailing silence.
        2. After STOP_MS of continuous silence, send the full segment to smart turn.
        3. If smart turn says "Incomplete", keep listening (return False).
        4. If smart turn says "Complete", finalize (return True).
        5. Hard cap at MAX_SPEECH_SECONDS always finalizes.
        """
        max_samples = MAX_SPEECH_SECONDS * 16000

        if sample_count >= max_samples:
            log("max_speech", "Reached max speech duration")
            return True

        if trailing_silence >= STOP_CHUNKS:
            audio_so_far = np.concatenate(self._audio_buffer)
            is_complete = self._smart_turn.is_end_of_turn(audio_so_far)
            if DEBUG:
                label = "Complete" if is_complete else "Incomplete"
                print(f"\n  Smart turn: {label}", file=sys.stderr)
            if is_complete:
                return True
            else:
                log("smart_turn_incomplete", "Continuing to listen...")
        return False

    def _dispatch_result(self, should_submit: bool, stripped: str) -> None:
        """Log and optionally submit a recognized command."""
        if stripped:
            if should_submit:
                log("dispatch_enter", stripped)
                if DEBUG:
                    print(f"  Final: {stripped} [Enter]", file=sys.stderr)
                keyboard.press_enter()
            else:
                log("dispatch_typed", stripped)
                if DEBUG:
                    print(f"  Final: {stripped} (no submit)", file=sys.stderr)
        elif should_submit:
            # Submit word only — erase it and press enter
            if self._typed_text:
                keyboard.backspace(len(self._typed_text))
            log("dispatch_enter", "(submit word only)")
            if DEBUG:
                print("  Submit word only [Enter]", file=sys.stderr)
            keyboard.press_enter()

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
            # Activated mode — full text is the command
            command = text.strip()
            if command:
                should_submit, stripped = self._strip_submit_word(command)
                if stripped:
                    if stripped != self._typed_text:
                        if self._typed_text:
                            self._update_typed_text(stripped)
                        else:
                            keyboard.type_text(stripped)
                self._dispatch_result(should_submit, stripped)
            else:
                if self._typed_text:
                    keyboard.backspace(len(self._typed_text))
                log("dispatch_cancelled", "Empty command in activated mode")
            self._reset_listening()
            return

        if self._wake_detected:
            # Correct final text and submit
            found, command = check_wake_word(text)
            if found and command:
                should_submit, stripped = self._strip_submit_word(command)
                if stripped:
                    if stripped != self._typed_text:
                        self._update_typed_text(stripped)
                self._dispatch_result(should_submit, stripped)
            elif found:
                # Wake word found but no command text after it
                if self._typed_text:
                    keyboard.backspace(len(self._typed_text))
                log("dispatch_cancelled", "No command after wake word")
            elif self._typed_text:
                # Final transcription lost the wake word (e.g. audio clipping
                # turned "computer" into "uter"); fall back to the command
                # captured during streaming
                should_submit, stripped = self._strip_submit_word(self._typed_text)
                self._dispatch_result(should_submit, stripped or self._typed_text)
        else:
            # Check final transcription for wake word
            found, command = check_wake_word(text)
            if found and command:
                should_submit, stripped = self._strip_submit_word(command)
                if stripped:
                    log("wake_word_detected", stripped)
                    if DEBUG:
                        label = "[Enter]" if should_submit else "(no submit)"
                        print(
                            f"  Wake word! Final: {stripped} {label}", file=sys.stderr
                        )
                    keyboard.type_text(stripped)
                    if should_submit:
                        keyboard.press_enter()
                else:
                    # Submit word only — just press enter
                    log("dispatch_enter", "(submit word only)")
                    if DEBUG:
                        print("  Wake word + submit word only [Enter]", file=sys.stderr)
                    keyboard.press_enter()
            if found and not command:
                # Wake word only — enter ACTIVATED state for next utterance
                log("wake_word_only", "Listening for command...")
                if DEBUG:
                    print(
                        "  Wake word heard — listening for command...", file=sys.stderr
                    )
                self._audio_buffer.clear()
                self._vad.reset()
                self._wake_detected = False
                self._typed_text = ""
                self._last_partial_at = 0
                self._activated_at = time.monotonic()
                self._state = ACTIVATED
                return  # don't reset to IDLE
            elif not found:
                log("no_wake_word", text)
                if DEBUG:
                    print(f"  No wake word: {text}", file=sys.stderr)

        self._reset_listening()

    def _reset_listening(self) -> None:
        self._audio_buffer.clear()
        self._vad.reset()
        self._wake_detected = False
        self._typed_text = ""
        self._last_partial_at = 0
        self._activated_at = 0.0
        self._state = IDLE

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
                    if self._state == ACTIVATED and not self._audio_buffer:
                        if time.monotonic() - self._activated_at > ACTIVATED_TIMEOUT:
                            log("activated_timeout", "No command received")
                            if DEBUG:
                                print("\n  Activation timed out", file=sys.stderr)
                            self._reset_listening()
                    continue

                prob = self._vad.process(chunk)

                if DEBUG:
                    _print_vad_bar(prob, self._vad.threshold, self._state, chunk)

                if self._state == IDLE:
                    if prob > self._vad.threshold:
                        log("speech_start")
                        self._state = LISTENING
                        self._audio_buffer.append(chunk)
                        sample_count = len(chunk)
                        trailing_silence = 0
                        self._last_partial_at = 0

                elif self._state == ACTIVATED:
                    # Check timeout (only before speech starts)
                    if not self._audio_buffer:
                        if time.monotonic() - self._activated_at > ACTIVATED_TIMEOUT:
                            log("activated_timeout", "No command received")
                            if DEBUG:
                                print("\n  Activation timed out", file=sys.stderr)
                            self._reset_listening()
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
