import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const POLL_MS = 200;

function indexLockPath(): string | undefined {
	try {
		const rel = execSync("git rev-parse --git-path index.lock", {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
		return rel ? resolve(rel) : undefined;
	} catch {
		return undefined;
	}
}

function sleepSync(ms: number): void {
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export function waitForIndexUnlocked(timeoutMs: number): boolean {
	const lock = indexLockPath();
	if (!lock) return true;
	const deadline = Date.now() + timeoutMs;
	while (existsSync(lock)) {
		if (Date.now() >= deadline) return false;
		sleepSync(POLL_MS);
	}
	return true;
}
