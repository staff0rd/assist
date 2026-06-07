import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import * as net from "node:net";
import { isDaemonRunning } from "./connectToDaemon";
import { createAutoExit } from "./createAutoExit";
import { daemonPaths } from "./daemonPaths";
import { handleConnection } from "./handleConnection";
import { SessionManager } from "./SessionManager";

export async function runDaemon(): Promise<void> {
	mkdirSync(daemonPaths.dir, { recursive: true });
	if (await isDaemonRunning()) {
		console.error("Sessions daemon is already running");
		process.exitCode = 1;
		return;
	}
	// A leftover socket file from a crashed daemon blocks listen() on unix
	if (process.platform !== "win32" && existsSync(daemonPaths.socket)) {
		unlinkSync(daemonPaths.socket);
	}

	const checkAutoExit = createAutoExit(() => {
		console.log("No sessions and no connected server; exiting");
		process.exit(0);
	});
	const manager = new SessionManager(checkAutoExit);
	manager.restore();

	const server = net.createServer((socket) =>
		handleConnection(socket, manager),
	);
	server.listen(daemonPaths.socket, () => {
		writeFileSync(daemonPaths.pid, String(process.pid));
		console.log(`Sessions daemon listening on ${daemonPaths.socket}`);
		checkAutoExit(manager.isIdle());
	});
}
