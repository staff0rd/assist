import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildDaemonEnv } from "./buildDaemonEnv";
import { bootstrapVenv, checkLockFile, writeLockFile } from "./checkLockFile";
import { getPythonDir, getVenvPython, voicePaths } from "./shared";

function spawnForeground(
	python: string,
	script: string,
	env: Record<string, string>,
): void {
	console.log("Starting voice daemon in foreground...");
	const child = spawn(python, [script], { stdio: "inherit", env });
	child.on("exit", (code) => process.exit(code ?? 0));
}

function spawnBackground(
	python: string,
	script: string,
	env: Record<string, string>,
): void {
	const child = spawn(python, [script], {
		detached: true,
		stdio: "ignore",
		env,
	});
	child.unref();

	const pid = child.pid;
	if (!pid) {
		console.error("Failed to start voice daemon");
		process.exit(1);
	}

	writeFileSync(voicePaths.pid, String(pid));
	writeLockFile(pid);
	console.log(`Voice daemon started (PID ${pid})`);
}

export function start(options: {
	foreground?: boolean;
	debug?: boolean;
}): void {
	mkdirSync(voicePaths.dir, { recursive: true });
	checkLockFile();
	bootstrapVenv();

	const debug =
		options.debug || options.foreground || process.platform === "win32";
	const env = buildDaemonEnv({ debug });
	const script = join(getPythonDir(), "voice_daemon.py");
	const python = getVenvPython();

	if (options.foreground) {
		spawnForeground(python, script, env);
	} else {
		spawnBackground(python, script, env);
	}
}
