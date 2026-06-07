import { spawn } from "node:child_process";
import { mkdirSync, openSync } from "node:fs";
import { isDaemonRunning } from "./connectToDaemon";
import { daemonPaths } from "./daemonPaths";

const SPAWN_TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 200;

export async function ensureDaemonRunning(): Promise<void> {
	if (await isDaemonRunning()) return;
	spawnDaemon();
	const deadline = Date.now() + SPAWN_TIMEOUT_MS;
	while (Date.now() < deadline) {
		await delay(RETRY_DELAY_MS);
		if (await isDaemonRunning()) return;
	}
	throw new Error(
		`Sessions daemon did not start within ${SPAWN_TIMEOUT_MS / 1000}s; see ${daemonPaths.log}`,
	);
}

function spawnDaemon(): void {
	mkdirSync(daemonPaths.dir, { recursive: true });
	const log = openSync(daemonPaths.log, "a");
	const child = spawn(process.execPath, [process.argv[1], "daemon", "run"], {
		detached: true,
		stdio: ["ignore", log, log],
	});
	child.unref();
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
