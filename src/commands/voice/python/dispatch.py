"""Dispatch — keyboard-based input into the active terminal."""

from logger import log

import keyboard


def dispatch(command: str) -> str:
    """Type the command and press Enter."""
    log("dispatch_start", command)
    keyboard.type_text(command)
    keyboard.press_enter()
    log("dispatch_done", command)
    return command
