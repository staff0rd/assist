import { spawn } from "node:child_process";
import {
	closeSync,
	mkdirSync,
	openSync,
	statSync,
	unlinkSync,
	writeSync,
} from "node:fs";
import { isDaemonRunning } from "./connectToDaemon";
import { daemonPaths } from "./daemonPaths";

const SPAWN_TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 200;
// A crashed spawner leaves its lock behind; a lock older than the spawn
// timeout cannot belong to a live spawn attempt
const STALE_LOCK_MS = SPAWN_TIMEOUT_MS + 5_000;

export async function ensureDaemonRunning(
	reason = "unspecified",
): Promise<void> {
	if (await isDaemonRunning()) return;
	mkdirSync(daemonPaths.dir, { recursive: true });
	// O_EXCL lock arbitrates concurrent spawn attempts across processes;
	// losers skip spawning and just poll for the socket
	const holdsLock = acquireSpawnLock();
	if (holdsLock) spawnDaemon(reason);
	try {
		await waitForDaemon();
	} finally {
		if (holdsLock) releaseSpawnLock();
	}
}

async function waitForDaemon(): Promise<void> {
	const deadline = Date.now() + SPAWN_TIMEOUT_MS;
	while (Date.now() < deadline) {
		await delay(RETRY_DELAY_MS);
		if (await isDaemonRunning()) return;
	}
	throw new Error(
		`Sessions daemon did not start within ${SPAWN_TIMEOUT_MS / 1000}s; see ${daemonPaths.log}`,
	);
}

function acquireSpawnLock(): boolean {
	if (tryCreateLock()) return true;
	if (!isLockStale()) return false;
	try {
		unlinkSync(daemonPaths.spawnLock);
	} catch {}
	return tryCreateLock();
}

function tryCreateLock(): boolean {
	try {
		const fd = openSync(daemonPaths.spawnLock, "wx");
		writeSync(fd, String(process.pid));
		closeSync(fd);
		return true;
	} catch {
		return false;
	}
}

function isLockStale(): boolean {
	try {
		return Date.now() - statSync(daemonPaths.spawnLock).mtimeMs > STALE_LOCK_MS;
	} catch {
		// Lock vanished between the failed create and the stat — retry create
		return true;
	}
}

function releaseSpawnLock(): void {
	try {
		unlinkSync(daemonPaths.spawnLock);
	} catch {}
}

function spawnDaemon(reason: string): void {
	const log = openSync(daemonPaths.log, "a");
	const child = spawn(process.execPath, [process.argv[1], "daemon", "run"], {
		detached: true,
		stdio: ["ignore", log, log],
		env: { ...process.env, ASSIST_DAEMON_SPAWN_REASON: reason },
	});
	child.unref();
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
