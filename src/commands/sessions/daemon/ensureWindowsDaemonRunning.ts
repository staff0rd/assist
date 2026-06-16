import { spawn } from "node:child_process";
import { isWindowsDaemonRunning } from "./connectToWindowsDaemon";
import { daemonLog } from "./daemonLog";

// node-for-windows plus a cold daemon start is slower than the WSL daemon
const SPAWN_TIMEOUT_MS = 30_000;
const RETRY_DELAY_MS = 300;

export async function ensureWindowsDaemonRunning(): Promise<void> {
	if (await isWindowsDaemonRunning()) {
		daemonLog("windows daemon: already running");
		return;
	}
	daemonLog("windows daemon: not running, launching via pwsh.exe");
	launchWindowsDaemon();
	await waitForWindowsDaemon();
}

// why: pwsh 7 (not powershell.exe 5.1) loads the profile that runs `fnm env`, putting the fnm-managed node and global `assist` shim on PATH; without the profile neither resolves
function launchWindowsDaemon(): void {
	const child = spawn("pwsh.exe", ["-Command", "assist daemon run"], {
		detached: true,
		stdio: "ignore",
	});
	child.on("error", (e) =>
		daemonLog(`failed to launch windows daemon: ${e.message}`),
	);
	child.unref();
}

async function waitForWindowsDaemon(): Promise<void> {
	const start = Date.now();
	const deadline = start + SPAWN_TIMEOUT_MS;
	let attempts = 0;
	while (Date.now() < deadline) {
		await delay(RETRY_DELAY_MS);
		attempts++;
		if (await isWindowsDaemonRunning()) {
			daemonLog(
				`windows daemon: up after ${Date.now() - start}ms (${attempts} attempts)`,
			);
			return;
		}
	}
	daemonLog(
		`windows daemon: did NOT start within ${SPAWN_TIMEOUT_MS}ms (${attempts} attempts)`,
	);
	throw new Error(
		"Windows daemon did not start; is assist installed on the Windows host?",
	);
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
