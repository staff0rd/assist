import { unlinkSync } from "node:fs";
import * as net from "node:net";
import { isDaemonRunning } from "./connectToDaemon";
import { daemonLog } from "./daemonLog";
import { daemonPaths } from "./daemonPaths";
import { handleConnection } from "./handleConnection";
import { onListening } from "./onListening";
import type { SessionManager } from "./SessionManager";
import { windowsDaemonPort } from "./windowsDaemonPort";

export function startDaemonServer(
	manager: SessionManager,
	checkAutoExit: (idle: boolean) => void,
): void {
	const server = net.createServer((socket) =>
		handleConnection(socket, manager),
	);
	// why: the WSL daemon cannot reach the Windows named pipe, so add a TCP bridge
	if (process.platform === "win32") startWindowsBridge(manager);
	let retried = false;
	server.on("error", (e: NodeJS.ErrnoException) => {
		if (e.code !== "EADDRINUSE" || retried) {
			daemonLog(`server error: ${e.message}; exiting`);
			process.exit(1);
		}
		retried = true;
		void recoverFromAddrInUse(server, manager, checkAutoExit);
	});
	// Sessions are restored only after the socket is bound, so a daemon that
	// loses the startup race never resumes a duplicate copy of them
	server.listen(daemonPaths.socket, () => onListening(manager, checkAutoExit));
}

function startWindowsBridge(manager: SessionManager): void {
	const port = windowsDaemonPort();
	const bridge = net.createServer((socket) =>
		handleConnection(socket, manager),
	);
	bridge.on("error", (e: NodeJS.ErrnoException) =>
		daemonLog(`windows bridge error: ${e.message}`),
	);
	bridge.listen(port, () => daemonLog(`windows bridge listening on :${port}`));
}

// The socket path is taken: either a live daemon owns it (this process lost
// the startup race) or a crashed daemon left a stale file behind. Never
// unlink without first confirming nothing answers on it.
async function recoverFromAddrInUse(
	server: net.Server,
	manager: SessionManager,
	checkAutoExit: (idle: boolean) => void,
): Promise<void> {
	if (await isDaemonRunning()) {
		daemonLog("another daemon owns the socket; exiting");
		process.exit(1);
	}
	daemonLog("removing stale socket left by a crashed daemon");
	if (process.platform !== "win32") {
		try {
			unlinkSync(daemonPaths.socket);
		} catch {}
	}
	server.listen(daemonPaths.socket, () => onListening(manager, checkAutoExit));
}
