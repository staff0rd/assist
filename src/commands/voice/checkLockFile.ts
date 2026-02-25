import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getLockFile, getPythonDir, getVenvPython, voicePaths } from "./shared";

function isProcessAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

export function checkLockFile(): void {
	const lockFile = getLockFile();
	if (!existsSync(lockFile)) return;

	try {
		const lock = JSON.parse(readFileSync(lockFile, "utf-8"));
		if (lock.pid && isProcessAlive(lock.pid)) {
			console.error(
				`Voice daemon already running (PID ${lock.pid}, env: ${lock.env}). Stop it first with: assist voice stop`,
			);
			process.exit(1);
		}
	} catch {
		// Stale or corrupt lock file, safe to proceed
	}
}

export function bootstrapVenv(): void {
	if (existsSync(getVenvPython())) return;

	console.log("Setting up Python environment...");
	const pythonDir = getPythonDir();
	execSync(
		`uv sync --project "${pythonDir}" --extra runtime --no-install-project`,
		{
			stdio: "inherit",
			env: { ...process.env, UV_PROJECT_ENVIRONMENT: voicePaths.venv },
		},
	);
}

export function writeLockFile(pid: number): void {
	const lockFile = getLockFile();
	mkdirSync(join(lockFile, ".."), { recursive: true });
	writeFileSync(
		lockFile,
		JSON.stringify({
			pid,
			env: process.platform === "win32" ? "win" : "wsl",
			timestamp: new Date().toISOString(),
		}),
	);
}
