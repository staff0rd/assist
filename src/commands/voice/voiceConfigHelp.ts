import type { ConfigHelpEntry } from "../../shared/configHelp";

export const voiceConfigHelp: ConfigHelpEntry[] = [
	{
		key: "voice.wakeWords",
		setter: 'assist config set voice.wakeWords "computer"',
		note: "wake words that activate the daemon (default: computer)",
	},
	{
		key: "voice.mic",
		setter: "assist config set voice.mic <device>",
		note: "audio input device (defaults to the system default)",
	},
	{
		key: "voice.cwd",
		setter: "assist config set voice.cwd <path>",
		note: "working directory commands are dispatched from",
	},
	{
		key: "voice.modelsDir",
		setter: "assist config set voice.modelsDir ~/.assist/voice/models",
		note: "directory VAD/STT models download to",
	},
	{
		key: "voice.lockDir",
		setter: "assist config set voice.lockDir <path>",
		note: "directory holding the daemon lock file",
	},
	{
		key: "voice.submitWindows",
		setter: 'assist config set voice.submitWindows "Code"',
		note: "window titles where transcriptions auto-submit",
	},
	{
		key: "voice.models.vad",
		setter: "assist config set voice.models.vad <path>",
		note: "override the voice-activity-detection model path",
	},
	{
		key: "voice.models.smartTurn",
		setter: "assist config set voice.models.smartTurn <path>",
		note: "override the smart-turn model path",
	},
];
