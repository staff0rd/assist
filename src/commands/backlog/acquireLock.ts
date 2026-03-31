import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getBacklogDir } from "./shared";

function getLockPath(itemId: number): string {
	return join(getBacklogDir(), `.assist-lock-${itemId}.json`);
}

function isProcessAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

export function isLockedByOther(itemId: number): boolean {
	const lockPath = getLockPath(itemId);
	if (!existsSync(lockPath)) return false;

	try {
		const lock = JSON.parse(readFileSync(lockPath, "utf-8"));
		if (lock.pid === process.pid) return false;
		return isProcessAlive(lock.pid);
	} catch {
		return false;
	}
}

export function acquireLock(itemId: number): void {
	writeFileSync(
		getLockPath(itemId),
		JSON.stringify({ pid: process.pid, timestamp: new Date().toISOString() }),
	);
}

export function releaseLock(itemId: number): void {
	const lockPath = getLockPath(itemId);
	try {
		unlinkSync(lockPath);
	} catch {
		// Lock file may already be removed
	}
}
