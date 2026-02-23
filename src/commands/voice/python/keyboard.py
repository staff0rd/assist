"""Simulate keyboard input on Windows via SendInput."""

import ctypes
import ctypes.wintypes as w

user32 = ctypes.windll.user32

INPUT_KEYBOARD = 1
KEYEVENTF_UNICODE = 0x0004
KEYEVENTF_KEYUP = 0x0002
KEYEVENTF_SCANCODE = 0x0008
VK_RETURN = 0x0D
VK_BACK = 0x08
SCAN_RETURN = 0x1C
SCAN_BACK = 0x0E


class KEYBDINPUT(ctypes.Structure):
    _fields_ = [
        ("wVk", w.WORD),
        ("wScan", w.WORD),
        ("dwFlags", w.DWORD),
        ("time", w.DWORD),
        ("dwExtraInfo", ctypes.POINTER(ctypes.c_ulong)),
    ]


class MOUSEINPUT(ctypes.Structure):
    _fields_ = [
        ("dx", ctypes.c_long),
        ("dy", ctypes.c_long),
        ("mouseData", w.DWORD),
        ("dwFlags", w.DWORD),
        ("time", w.DWORD),
        ("dwExtraInfo", ctypes.POINTER(ctypes.c_ulong)),
    ]


class INPUT(ctypes.Structure):
    class _INPUT(ctypes.Union):
        _fields_ = [("mi", MOUSEINPUT), ("ki", KEYBDINPUT)]

    _anonymous_ = ("_input",)
    _fields_ = [("type", w.DWORD), ("_input", _INPUT)]


def _send_key(vk: int = 0, scan: int = 0, flags: int = 0) -> None:
    inp = INPUT(type=INPUT_KEYBOARD)
    inp.ki.wVk = vk
    inp.ki.wScan = scan
    inp.ki.dwFlags = flags
    user32.SendInput(1, ctypes.byref(inp), ctypes.sizeof(inp))


def type_text(text: str) -> None:
    """Type a string by sending Unicode keystrokes."""
    for ch in text:
        code = ord(ch)
        _send_key(scan=code, flags=KEYEVENTF_UNICODE)
        _send_key(scan=code, flags=KEYEVENTF_UNICODE | KEYEVENTF_KEYUP)


def backspace(n: int = 1) -> None:
    """Press backspace n times."""
    for _ in range(n):
        _send_key(vk=VK_BACK, scan=SCAN_BACK)
        _send_key(vk=VK_BACK, scan=SCAN_BACK, flags=KEYEVENTF_KEYUP)


def press_enter() -> None:
    """Press the Enter key."""
    _send_key(vk=VK_RETURN, scan=SCAN_RETURN)
    _send_key(vk=VK_RETURN, scan=SCAN_RETURN, flags=KEYEVENTF_KEYUP)
