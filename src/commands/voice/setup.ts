import { execSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getPythonDir, getVenvPython, voicePaths } from "./shared";

export function setup(): void {
	mkdirSync(voicePaths.dir, { recursive: true });

	if (!existsSync(getVenvPython())) {
		console.log("Creating Python virtual environment...");
		execSync(`uv venv "${voicePaths.venv}"`, { stdio: "inherit" });

		console.log("Installing dependencies...");
		const pythonDir = getPythonDir();
		execSync(
			`uv pip install --python "${getVenvPython()}" -e "${pythonDir}[dev]"`,
			{ stdio: "inherit" },
		);
	}

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
