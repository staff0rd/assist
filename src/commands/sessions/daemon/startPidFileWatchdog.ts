import { readFileSync } from "node:fs";
import { daemonPaths } from "./daemonPaths";

const WATCHDOG_INTERVAL_MS = 5_000;

// daemon.pid is the ownership token: a daemon that loses it (another daemon
// won a startup race and overwrote it) must not keep running orphaned
export function startPidFileWatchdog(
	onLost: () => void,
	intervalMs = WATCHDOG_INTERVAL_MS,
): NodeJS.Timeout {
	const timer = setInterval(() => {
		if (!ownsPidFile()) onLost();
	}, intervalMs);
	timer.unref();
	return timer;
}

export function ownsPidFile(): boolean {
	try {
		return readFileSync(daemonPaths.pid, "utf8").trim() === String(process.pid);
	} catch {
		return false;
	}
}
