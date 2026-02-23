import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../../shared/loadConfig";

const __dirname = dirname(fileURLToPath(import.meta.url));

const VOICE_DIR = join(homedir(), ".assist", "voice");

export const voicePaths = {
	dir: VOICE_DIR,
	pid: join(VOICE_DIR, "voice.pid"),
	log: join(VOICE_DIR, "voice.log"),
	venv: join(VOICE_DIR, ".venv"),
	lock: join(VOICE_DIR, "voice.lock"),
};

export function getPythonDir(): string {
	return join(__dirname, "commands", "voice", "python");
}

export function getVenvPython(): string {
	return process.platform === "win32"
		? join(voicePaths.venv, "Scripts", "python.exe")
		: join(voicePaths.venv, "bin", "python");
}

function getLockDir(): string {
	const config = loadConfig();
	return config.voice?.lockDir ?? VOICE_DIR;
}

export function getLockFile(): string {
	return join(getLockDir(), "voice.lock");
}
