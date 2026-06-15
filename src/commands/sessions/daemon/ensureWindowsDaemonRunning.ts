import { spawn } from "node:child_process";
import { isWindowsDaemonRunning } from "./connectToWindowsDaemon";
import { daemonLog } from "./daemonLog";

// node-for-windows plus a cold daemon start is slower than the WSL daemon
const SPAWN_TIMEOUT_MS = 30_000;
const RETRY_DELAY_MS = 300;

export async function ensureWindowsDaemonRunning(): Promise<void> {
	if (await isWindowsDaemonRunning()) return;
	launchWindowsDaemon();
	await waitForWindowsDaemon();
}

function launchWindowsDaemon(): void {
	// `start "" assist daemon run` detaches a native Windows assist daemon via
	// WSL interop; the empty title arg is required by cmd's start syntax
	const child = spawn(
		"cmd.exe",
		["/c", "start", "", "assist", "daemon", "run"],
		{ detached: true, stdio: "ignore" },
	);
	child.on("error", (e) =>
		daemonLog(`failed to launch windows daemon: ${e.message}`),
	);
	child.unref();
}

async function waitForWindowsDaemon(): Promise<void> {
	const deadline = Date.now() + SPAWN_TIMEOUT_MS;
	while (Date.now() < deadline) {
		await delay(RETRY_DELAY_MS);
		if (await isWindowsDaemonRunning()) return;
	}
	throw new Error(
		"Windows daemon did not start; is assist installed on the Windows host?",
	);
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
