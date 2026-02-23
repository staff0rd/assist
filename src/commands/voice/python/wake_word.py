"""Keyword detection in transcribed text."""

import os

from logger import log

DEFAULT_WAKE_WORDS = ["hi claude"]


def get_wake_words() -> list[str]:
    env = os.environ.get("VOICE_WAKE_WORDS", "")
    if env:
        return [w.strip().lower() for w in env.split(",") if w.strip()]
    return DEFAULT_WAKE_WORDS


def check_wake_word(text: str) -> tuple[bool, str]:
    """Check if text contains a wake word. Returns (found, remaining_text)."""
    lower = text.lower()
    for word in get_wake_words():
        idx = lower.find(word)
        if idx != -1:
            remaining = text[idx + len(word) :].strip().lstrip(",").strip()
            log("wake_word_detected", word, remaining=remaining)
            return True, remaining
    return False, text
