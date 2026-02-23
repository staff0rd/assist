import { loadConfig } from "../../shared/loadConfig";
import { voicePaths } from "./shared";

const ENV_MAP: Record<
	string,
	(v: NonNullable<ReturnType<typeof loadConfig>["voice"]>) => string | undefined
> = {
	VOICE_WAKE_WORDS: (v) => v.wakeWords?.join(","),
	VOICE_MIC: (v) => v.mic,
	VOICE_CWD: (v) => v.cwd,
	VOICE_MODELS_DIR: (v) => v.modelsDir,
	VOICE_MODEL_VAD: (v) => v.models?.vad,
	VOICE_MODEL_SMART_TURN: (v) => v.models?.smartTurn,
	VOICE_MODEL_STT: (v) => v.models?.stt,
};

export function buildDaemonEnv(options?: {
	debug?: boolean;
}): Record<string, string> {
	const config = loadConfig();
	const env = { ...process.env } as Record<string, string>;
	const voice = config.voice;
	if (voice) {
		for (const [key, getter] of Object.entries(ENV_MAP)) {
			const value = getter(voice);
			if (value) env[key] = value;
		}
	}
	env.VOICE_LOG_FILE = voicePaths.log;
	if (options?.debug) env.VOICE_DEBUG = "1";
	return env;
}
