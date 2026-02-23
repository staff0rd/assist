"""List available audio input devices."""

import sounddevice as sd


def main() -> None:
    devices = sd.query_devices()
    print("Audio input devices:\n")
    for i, dev in enumerate(devices):
        if dev["max_input_channels"] > 0:
            default = " (default)" if i == sd.default.device[0] else ""
            print(f"  [{i}] {dev['name']}{default}")
            ch = dev["max_input_channels"]
            rate = dev["default_samplerate"]
            print(f"      channels={ch}, rate={rate}")
            print()


if __name__ == "__main__":
    main()
