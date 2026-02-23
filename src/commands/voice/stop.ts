import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { getLockFile, voicePaths } from "./shared";

export function stop(): void {
	if (!existsSync(voicePaths.pid)) {
		console.log("Voice daemon is not running (no PID file)");
		return;
	}

	const pid = Number.parseInt(readFileSync(voicePaths.pid, "utf-8").trim(), 10);

	try {
		process.kill(pid, "SIGTERM");
		console.log(`Sent SIGTERM to voice daemon (PID ${pid})`);
	} catch {
		console.log(`Voice daemon (PID ${pid}) is not running`);
	}

	try {
		unlinkSync(voicePaths.pid);
	} catch {}

	try {
		const lockFile = getLockFile();
		if (existsSync(lockFile)) unlinkSync(lockFile);
	} catch {}

	console.log("Voice daemon stopped");
}
