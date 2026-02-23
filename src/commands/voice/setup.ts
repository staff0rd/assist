import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { bootstrapVenv } from "./checkLockFile";
import { getPythonDir, getVenvPython, voicePaths } from "./shared";

export function setup(): void {
	mkdirSync(voicePaths.dir, { recursive: true });

	bootstrapVenv();

	console.log("\nDownloading models...\n");
	const script = join(getPythonDir(), "setup_models.py");
	const result = spawnSync(getVenvPython(), [script], {
		stdio: "inherit",
		env: { ...process.env, VOICE_LOG_FILE: voicePaths.log },
	});

	if (result.status !== 0) {
		console.error("Model setup failed");
		process.exit(1);
	}
}
