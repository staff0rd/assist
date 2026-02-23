# Voice Feature Progress

## What's done

- **TypeScript CLI commands**: `assist voice start|stop|status|logs|setup|devices` all working
- **Python daemon**: Full pipeline — AudioCapture → Silero VAD → Smart Turn → Parakeet STT → wake word → dispatch
- **Model setup**: `assist voice setup` downloads Silero VAD (ONNX from GitHub), Smart Turn v3.2 (ONNX from HuggingFace pipecat-ai/smart-turn-v3), Parakeet STT (NeMo from_pretrained)
- **Config schema**: `voice` key in assistConfigSchema with wakeWords, mic, cwd, modelsDir, lockDir, models
- **Build/verify**: tsup copies python dir, ruff lint+format via `uv run --project`, biome/knip exclude .venv
- **Claude commands**: /voice-setup, /voice-start, /voice-stop, /voice-status, /voice-logs
- **Debug mode**: `--foreground` flag shows live VAD meter with rms/peak audio levels
- **Misc**: `assist sync --yes` flag added

## Current blocker

- **Mic audio not reaching VAD**: Daemon starts, mic activates (headset enters mic mode), but VAD reads 0.00 and rms/peak show no signal. Debug bar with rms/peak was just added to diagnose whether sounddevice is delivering samples or the issue is in VAD processing.

## Not yet done

- Dispatch mechanism back into current Claude session (currently spawns standalone `claude -p`)
- TTS response playback
- Noise gate / energy pre-filter
- Graceful handling if models aren't set up when starting
