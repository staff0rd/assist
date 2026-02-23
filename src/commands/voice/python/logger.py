"""JSON Lines structured logging to voice.log."""

import json
import os
import sys
from datetime import datetime, timezone


LOG_FILE = os.environ.get(
    "VOICE_LOG_FILE", os.path.expanduser("~/.assist/voice/voice.log")
)

DEBUG = os.environ.get("VOICE_DEBUG", "") == "1"


def _write(entry: dict) -> None:
    entry["timestamp"] = datetime.now(timezone.utc).isoformat()
    line = json.dumps(entry)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except OSError:
        pass
    if DEBUG:
        ts = entry["timestamp"][11:19]
        level = entry.get("level", "info").upper()
        event = entry.get("event", "")
        msg = entry.get("message", "")
        print(f"{ts} {level:5s} [{event}] {msg}", file=sys.stderr, flush=True)


def log(event: str, message: str = "", *, level: str = "info", **data) -> None:
    entry: dict = {"event": event, "level": level}
    if message:
        entry["message"] = message
    if data:
        entry["data"] = data
    _write(entry)
