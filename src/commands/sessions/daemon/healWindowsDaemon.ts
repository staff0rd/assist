import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import type { Readable } from "node:stream";
import { daemonLog } from "./daemonLog";

// assist update on the Windows host can be slow: npm install + build under
// node-for-windows is far heavier than a WSL rebuild.
const UPDATE_TIMEOUT_MS = 5 * 60_000;
const STOP_TIMEOUT_MS = 30_000;

// On a version handshake mismatch, bring the Windows host up to date and stop
// its stale daemon, so the WSL proxy can relaunch the freshly-installed version
// (relaunch is handled by ensureWindowsDaemonRunning on the next connect).
export async function healWindowsDaemon(): Promise<void> {
	daemonLog("windows daemon: auto-heal: running `assist update` on host");
	await runOnWindowsHost("assist update", UPDATE_TIMEOUT_MS);
	daemonLog("windows daemon: auto-heal: update done, stopping stale daemon");
	await runOnWindowsHost("assist daemon stop", STOP_TIMEOUT_MS);
	daemonLog("windows daemon: auto-heal: stale daemon stopped");
}

// why: pwsh 7's profile runs `fnm env`, putting node + the global assist shim on
// PATH — matching how the daemon itself is launched (ensureWindowsDaemonRunning)
function runOnWindowsHost(command: string, timeoutMs: number): Promise<void> {
	return new Promise((resolve, reject) => {
		// why: pipe stdout/stderr into daemon.log so the host update is observable
		const child = spawn("pwsh.exe", ["-Command", command], {
			stdio: ["ignore", "pipe", "pipe"],
		});
		logStream(child.stdout, command);
		logStream(child.stderr, command);
		const timer = setTimeout(() => {
			child.kill();
			reject(
				new Error(
					`'${command}' on the Windows host timed out after ${timeoutMs}ms`,
				),
			);
		}, timeoutMs);
		child.on("error", (e) => {
			clearTimeout(timer);
			reject(e);
		});
		child.on("exit", (code) => {
			clearTimeout(timer);
			if (code === 0) resolve();
			else
				reject(
					new Error(
						`'${command}' on the Windows host exited with code ${code}`,
					),
				);
		});
	});
}

function logStream(stream: Readable | null, command: string): void {
	if (!stream) return;
	const lines = createInterface({ input: stream });
	lines.on("line", (line) => daemonLog(`[windows ${command}] ${line}`));
	lines.on("error", () => {});
}
