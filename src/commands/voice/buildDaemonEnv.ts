import { voicePaths } from "./shared";

export function buildDaemonEnv(options?: {
	debug?: boolean;
}): Record<string, string> {
	const env = { ...process.env } as Record<string, string>;
	env.VOICE_LOG_FILE = voicePaths.log;
	if (options?.debug) env.VOICE_DEBUG = "1";
	return env;
}
