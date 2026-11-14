import { readFileSync } from "node:fs";
import { buildLockPath } from "./buildLockPath";

function isAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		return (error as NodeJS.ErrnoException).code === "EPERM";
	}
}

export function isBuildInFlight(installDir: string): boolean {
	let pid: number;
	try {
		pid = Number(readFileSync(buildLockPath(installDir), "utf8").trim());
	} catch {
		return false;
	}
	// A build that crashed leaves its lock behind; only a live builder holds it
	return Number.isInteger(pid) && pid > 0 && isAlive(pid);
}
