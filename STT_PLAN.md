# Voice Interaction Feature for Assist

## Context

Add an always-on voice daemon to assist that listens for a wake word ("Claude") and dispatches spoken commands to Claude Code headlessly. This removes the need to type commands — just speak naturally and mention Claude to trigger tasks (transcribe a video, add to shopping list, respond to a message, etc.).

The pipeline uses 3 ML models: **Silero VAD** (voice activity detection, ONNX/CPU), **Smart Turn** (end-of-utterance detection, ONNX/CPU), and **Parakeet** (NVIDIA NeMo STT, GPU). A Python daemon handles all audio/ML work; Node.js manages its lifecycle.

## Architecture

```
┌──────────────────────────────────┐
│  /voice-start → assist voice start│  Claude Code slash commands
│  /voice-stop  → assist voice stop │
│  /voice-status                    │
│  /voice-logs                      │
└──────────────┬───────────────────┘
               │ spawns
┌──────────────▼───────────────────┐
│  assist voice (Node.js)          │  Lifecycle manager
│  - PID file management           │  ~/.assist/voice/voice.pid
│  - Python venv bootstrap (uv)    │  ~/.assist/voice/.venv
│  - Log tailing                   │  ~/.assist/voice/voice.log
└──────────────┬───────────────────┘
               │ spawns detached Python process
┌──────────────▼───────────────────┐
│  voice_daemon.py                 │
│  Mic → Silero VAD → Smart Turn   │
│       → Parakeet STT             │
│       → Wake word check          │
│       → claude -p "command"      │
└──────────────────────────────────┘
```

## Files to Create

### Node.js (TypeScript)

- **`src/commands/voice/index.ts`** — barrel export
- **`src/commands/voice/start.ts`** — bootstrap venv, spawn Python daemon detached, write PID
- **`src/commands/voice/stop.ts`** — read PID, SIGTERM, cleanup
- **`src/commands/voice/status.ts`** — check PID alive, show recent log events
- **`src/commands/voice/logs.ts`** — tail voice.log with pretty-printing
- **`src/commands/voice/shared.ts`** — path constants (`~/.assist/voice/{voice.pid,voice.log,.venv}`)
- **`src/commands/registerVoice.ts`** — Commander subcommand registration (pattern: `src/commands/registerVerify.ts`)

### Python (in `src/commands/voice/python/`)

- **`pyproject.toml`** — deps: onnxruntime, sounddevice, numpy, nemo_toolkit[asr], silero-vad
- **`voice_daemon.py`** — entry point, main loop, signal handling
- **`audio_capture.py`** — mic capture via sounddevice (16kHz PCM)
- **`vad.py`** — Silero VAD wrapper (ONNX)
- **`smart_turn.py`** — Smart Turn end-of-utterance detection (ONNX)
- **`stt.py`** — Parakeet NeMo STT wrapper (GPU)
- **`wake_word.py`** — keyword detection in transcribed text
- **`dispatch.py`** — spawn `claude -p "command"`, capture result
- **`logger.py`** — JSON Lines structured logging to voice.log

### Claude Slash Commands (in `claude/commands/`)

- **`voice-start.md`** — `/voice-start` → runs `assist voice start`
- **`voice-stop.md`** — `/voice-stop` → runs `assist voice stop`
- **`voice-status.md`** — `/voice-status` → runs `assist voice status`
- **`voice-logs.md`** — `/voice-logs` → runs `assist voice logs`

### Settings

- **`claude/settings.json`** — add `Bash(assist voice:*)` permission and `SlashCommand`/`Skill` entries for each voice command

## Files to Modify

- **`src/shared/types.ts`** — add `voice` key to `assistConfigSchema`
- **`src/index.ts`** — import and call `registerVoice(program)`
- **`tsup.config.ts`** — add `cpSync` for `voice/python/` directory in `onSuccess`
- **`README.md`** — document the new `voice` command

## Config Schema Addition (`src/shared/types.ts`)

```typescript
voice: z.strictObject({
  wakeWords: z.array(z.string()).default(["claude"]),
  mic: z.string().optional(),           // audio device name
  cwd: z.string().optional(),           // working directory for dispatch
  modelsDir: z.string().optional(),     // shared model storage path (cross-env)
  lockDir: z.string().optional(),       // shared lock file directory (cross-env)
  models: z.strictObject({
    vad: z.string().optional(),         // custom Silero ONNX path
    smartTurn: z.string().optional(),   // custom Smart Turn ONNX path
    stt: z.string().optional(),         // custom Parakeet model path
  }).optional(),
}).optional()
```

## Python Daemon Flow

```
IDLE → (VAD detects speech) → LISTENING → (Smart Turn: end of turn) → PROCESSING
  ↑                                                                        │
  └── Parakeet STT → wake word check → dispatch claude -p ─────────────────┘
```

1. **Audio capture**: continuous 16kHz PCM from mic via sounddevice
2. **VAD**: Silero processes ~30ms chunks, returns speech probability
3. **State machine**: IDLE→LISTENING when speech_prob > threshold; accumulates frames
4. **Turn detection**: Smart Turn determines utterance-complete vs thinking-pause
5. **STT**: Parakeet transcribes accumulated audio buffer
6. **Wake word**: check if transcription contains a configured wake word
7. **Dispatch**: strip wake word, run `claude -p "remaining text"` with configured cwd
8. **Logging**: every event written as JSON Line to `~/.assist/voice/voice.log`

## Cross-Environment (WSL + PowerShell)

`assist` is installed in both WSL and PowerShell on the same Windows 11 machine. Key considerations:

**Naturally separate (no conflict):**
- PID files, logs — `~` resolves to `/home/stafford` (WSL) vs `C:\Users\stafford` (PowerShell)
- Python venvs — must be separate (Linux vs Windows binaries)

**Shared model storage:**
- Config `voice.modelsDir` points both environments at the same physical directory
- Default: `~/.assist/voice/models/` (per-environment)
- To share: set `modelsDir` in WSL config to `/mnt/c/Users/stafford/.assist/voice/models/` and in Windows config to `C:\Users\stafford\.assist\voice\models\` — same physical location
- Models are downloaded once, used by both (ONNX files are platform-independent)
- NeMo/Parakeet model weights are also platform-independent

**Cross-environment lock file:**
- Prevents both WSL and PowerShell daemons from running simultaneously (mic + GPU contention)
- Config `voice.lockDir` specifies a shared directory both environments can write to
- Default: same as `modelsDir` (or `~/.assist/voice/` if not shared)
- On `assist voice start`: write `voice.lock` containing PID + environment (wsl/win) + timestamp
- On `assist voice start` (other env): check lock file, if process is alive in the other env, refuse to start with a clear message
- On `assist voice stop`: remove lock file
- Lock file also cleaned up if stale (process no longer running)

## Daemon Lifecycle

- **`assist voice start`**: create `~/.assist/voice/` dir, bootstrap venv via `uv` if needed, spawn `voice_daemon.py` detached (`{ detached: true, stdio: "ignore" }` + `child.unref()`), write PID file
- **`assist voice start --foreground`**: run in foreground for debugging (stdio inherited)
- **`assist voice stop`**: read PID, send SIGTERM, wait for exit, clean up PID file
- **`assist voice status`**: check if PID is alive, show recent log events
- **`assist voice logs [-n 20]`**: tail and pretty-print the JSON Lines log

## Python Environment (uv)

- **`uv`** manages the Python venv and dependency installation
- On `assist voice start`, if `~/.assist/voice/.venv` doesn't exist:
  1. `uv venv ~/.assist/voice/.venv`
  2. `uv pip install --python ~/.assist/voice/.venv/bin/python -e <python dir>` (or from pyproject.toml)
- Subsequent starts skip venv bootstrap (fast path)
- `assist voice setup` (optional subcommand) to force re-create the venv
- Separate venvs per environment (WSL Linux venv, PowerShell Windows venv) — only models are shared

## Implementation Phases

1. **Skeleton** — directory structure, registerVoice, shared paths, config schema, slash commands, settings.json, README
2. **Daemon lifecycle** — PID file management, venv bootstrap with `uv`, spawn/kill, log tailing (test with a trivial Python script that writes periodic JSON Lines)
3. **Audio capture + VAD** — `audio_capture.py`, `vad.py`, logging speech detection events
4. **Smart Turn + STT** — `smart_turn.py`, `stt.py`, logging transcriptions
5. **Wake word + dispatch** — `wake_word.py`, `dispatch.py`, end-to-end voice→Claude flow

## Verification

1. `assist voice start` → daemon PID written, process running
2. `assist voice status` → shows "listening" state
3. `assist voice logs` → shows structured events
4. Speak "Claude, what time is it" → log shows transcription, command extraction, dispatch
5. `assist voice stop` → clean shutdown, PID removed
6. `/verify` passes (types, lint, build)
